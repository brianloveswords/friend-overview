const userDb = require('./db').sublevel('user')
const map = require('map-stream')
const hydrateFriends = require('./hydrate-friends')
const getFriends = require('./get-friends')

const FIELDS = [
  'id',
  'name',
  'screen_name',
  'location',
  'description',
  'url',
  'followers_count',
  'friends_count',
  'profile_image_url_https',
  'recent_statuses',
  'recent_statuses_last_updated',
]

module.exports = storeFriends

function storeFriends(handle, callback) {
  getFriends(handle, function (err, ids) {
    if (err) return callback(err)

    const writeStream = userDb.createWriteStream({
      valueEncoding: 'json'
    })

    userDb.createKeyStream()
      .pipe(map(deduplicate(ids)))
      .on('close', finish)

    function finish() {
      const newIds = ids.filter(notNull)
      const stats = {
        skipped: ids.length - newIds.length,
        stored: 0
      }

      if (!newIds.length)
        return callback(null, stats)

      hydrateFriends(newIds)
        .on('batch', logger)
        .pipe(map(stripFields))
        .pipe(map(toKeyValue))
        .pipe(map(keepStats(stats)))
        .pipe(writeStream)
        .on('close', function () { console.log('write stream closed') })
        .on('close', function () { callback(null, stats) })
    }

  })
}

storeFriends.db = userDb

function deduplicate(ids) {
  return function (id, next) {
    const idx = ids.indexOf(parseInt(id, 10))
    if (idx == -1)
      return next()
    ids[idx] = null
    return next()
  }
}

function keepStats(stats) {
  return function (obj, next) {
    stats.stored++
    return next(null, obj)
  }
}

function stripFields(obj, next) {
  obj = partialCopy(FIELDS, obj)
  return next(null, obj)
}

function toKeyValue(obj, next) {
  return next(null, { key: obj.id, value: obj })
}

function logger(start, end) {
  console.error('start: %s, end: %s', start, end)
}

function notNull(id) {
  return id !== null
}

function partialCopy(fields, obj) {
  return fields.reduce(function (copy, field) {
    copy[field] = obj[field]
    return copy
  }, {})
}
