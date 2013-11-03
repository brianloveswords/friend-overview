const fs = require('fs')
const path = require('path')
const map = require('map-stream')

const dbPath = path.join(__dirname, 'db')
process.env.DB_PATH = dbPath

const test = require('tap').test

test.clearDatabase = function (db, callback) {
  const readStream = db.createReadStream()
  const writeStream = db.createWriteStream()

  readStream
    .pipe(map(deleteOp))
    .pipe(writeStream)
    .on('close', callback)
}

function deleteOp(item, next) {
  item.type = 'del'
  return next(null, item)
}

module.exports = test
