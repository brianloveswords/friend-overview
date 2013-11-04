const db = require('./db').sublevel('user')

module.exports = function () {
  return db.createReadStream()
}
