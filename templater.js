const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')

module.exports = {
  header: tpl('header.html'),
  entry: tpl('friend-entry.html'),
  footer: tpl('footer.html'),
}

function read(name) {
  return fs.readFileSync(path.join(__dirname, name)).toString('utf8')
}

function tpl(name) {
  return function (data) {
    return handlebars.compile(read(name))(data)
  }
}
