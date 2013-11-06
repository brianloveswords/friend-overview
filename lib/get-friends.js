const cache = require('./models/cache-op')
const friendship = require('./models/friendship')
const client = require('./twitter-client')

module.exports = getFriends

const cacheTTL = 1000 * 60 * 60 * 24 // one day

function getFriends(handle, callback) {
  // TODO: handle users who follow more than 5000 people
  return refreshCache(handle, callback)
}

function refreshCache(handle, callback) {
  return client.get('friends/ids', {
    screen_name: handle
  }, function (err, response) {
    if (err) return callback(err)

    const friendIds = response.ids.slice()
    const writeStream = friendship.createWriteStream()


    writeStream.on('error', function (err, meta) {
      console.error(err)
      console.error(meta)
    })

    writeStream.on('drain', writeOne)

    writeStream.on('row', function (row, meta) {
      console.error('wrote row', row, meta)
    })

    function writeOne() {
      const id = response.ids.pop()
      if (!id) {
        callback(null, friendIds)
        return writeStream.end()
      }

      writeStream.write({
        screen_name: handle,
        friend: id
      })
    }

    writeOne()
  })
}

getFriends.db = friendship
