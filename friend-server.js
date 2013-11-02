const fs = require('fs')
const path = require('path')
const http = require('http')
const db = require('level')('db')
const JSONStream = require('JSONStream')
const map = require('map-stream')
const tpl = require('./templater.js')
const url = require('url')
const mime = require('mime')

function showUserList(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.write(tpl.header({
    title: 'eatabaggadicks'
  }))
  db.createValueStream({
    start: 'user-by-last-tweet-',
    end: 'user-by-last-tweet-\xff',
    valueEncoding: 'json',
  }).pipe(map(fixDate))
    .pipe(map(makeWriter(res)))
    .on('end', writeFooter)
    .pipe(res, { end: false })
  function writeFooter() {
    res.write(tpl.footer())
    res.end()
  }
}

function fixDate(data, next) {
  const time = data.status.created_at
  data.status.created_at = (new Date(time)).toISOString()
  next(null, data)
}

function makeWriter(res) {
  return function (data, next) {
    res.write(tpl.entry(data))
    return next()
  }
}

const server = http.createServer()
server.on('listening', function () {
  const addr = this.address();
  console.dir(addr)
})
server.listen(process.env.PORT || 8000)
server.on('request', function (req, res) {
  const parts = url.parse(req.url)
  if (parts.pathname == '/')
    return showUserList(req, res)

  return loadStaticFile(parts.pathname, req, res)
})

function loadStaticFile(pathname, req, res) {
  const contentType = mime.lookup(pathname)
  const prefix = path.join(__dirname, 'static')
  res.setHeader('content-type', contentType)

  fs.createReadStream(path.join(prefix, pathname))
    .on('error', handleReadError)
    .pipe(res)

  function handleReadError(err) {
    res.writeHead(404, {'content-type': 'text/plain'})
    res.write('File Not Found')
    res.end()
  }
}
