const map = require('map-stream')
const Level = require('level')
const SubLevel = require('level-sublevel')
const dbPath = process.env.DB_PATH || 'db'

const dbHandle = Object.create(SubLevel(Level(dbPath)))
module.exports = dbHandle

dbHandle.purgeDatabase = function purgeDatabase(db, callback) {
  const readable = db.createReadStream()
  const writeable = db.createWriteStream()

  readable
    .pipe(map(makeDeleteOp))
    .pipe(writeable)
    .on('error', callback)
    .on('close', callback)
}

function makeDeleteOp(entry, next) {
  entry.type = 'del'
  return next(null, entry)
}
