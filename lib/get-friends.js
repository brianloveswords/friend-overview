const cache = require('./models/cache-op')
const friendship = require('./models/friendship')
const client = require('./twitter-client')
const map = require('map-stream')
const concat = require('concat-stream')

module.exports = getFriends

const cacheTTL = 1000 * 60 * 60 * 24 // one day

function getFriends(handle, callback) {
  // TODO: handle users who follow more than 5000 people
  cache.isFresh('getFriends', cacheTTL, function (err, fresh) {
    if (err) return callback(err)
    if (!fresh)
      return refreshCache(handle, callback)
    return useCache(handle, callback)
  })
}

function useCache(handle, callback) {
  console.error('using cache')
  friendship.createReadStream({
    handle: 'brianloveswords'
  }).on('error', callback)
    .pipe(map(function (row, next) {
      next(null, row.friend)
    }))
    .pipe(concat(function (friends) {
      return callback(null, friends)
    }))
}

function refreshCache(handle, callback) {
  console.error('refreshing cache')
  return client.get('friends/ids', {
    screen_name: handle
  }, function (err, response) {
    if (err) return callback(err)
    const friendIds = response.ids.slice()

    // this should be done in a transaction when that's possible
    friendship.del({screen_name: handle}, function (err) {
      if (err) return callback(err)

      const writeStream = friendship.createWriteStream()
        .on('error', function (err, meta) {
          console.error(err)
          console.error(meta)
        })

        .on('drain', writeOne)

        .on('row', function (row, meta) {
          console.error('wrote row', row, meta)
        })

      function writeOne() {
        const id = response.ids.pop()
        if (!id) {
          cache.update('getFriends', function (err) {
            if (err) return callback(err)
            callback(null, friendIds)
            return writeStream.end()
          })
        }

        writeStream.write({
          screen_name: handle,
          friend: id
        })
      }

      writeOne()
    })
  })
}

getFriends.db = friendship
