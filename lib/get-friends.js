const db = require('./db').sublevel('friends-of')
const client = require('./twitter-client')

module.exports = getFriends

const cacheTTL = 1000 * 60 * 60 * 24 // one day

function getFriends(handle, callback) {
  // TODO: handle users who follow more than 5000 people

  db.get(handle, function (err, entry) {
    if (!err) {
      if (!isFresh(entry)) {
        console.error('cache is stale for `%s`', handle)
        return refreshCache(handle, callback)
      }

      console.error('pulling friends of `%s` from cache', handle)
      return callback(null, entry.friends)
    }

    if (err.notFound) {
      console.error('cache miss for `%s`', handle)
      return refreshCache(handle, callback)
    }

    else return callback(err)
  })
}

function isFresh(entry, ttl) {
  ttl = ttl || cacheTTL
  return entry.lastUpdate + ttl > Date.now()
}

function refreshCache(handle, callback) {
  return client.get('friends/ids', {
    screen_name: handle
  }, function (err, response) {
    if (err) return callback(err)

    const newEntry = {
      lastUpdate: Date.now(),
      friends: response.ids
    }

    db.put(handle, newEntry, function (err) {
      if (err) return callback(err)
      return callback(null, response.ids)
    })
  })
}

getFriends.db = db
