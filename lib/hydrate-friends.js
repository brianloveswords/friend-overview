const stream = require('stream')
const concat = require('concat-stream')
const map = require('map-stream')
const client = require('./twitter-client')
const db = require('./db')
const batcher = require('./batcher')
const util = require('util')

const LIMIT = 100
const PATH = 'users/lookup'

module.exports = hydrateUsers

function hydrateUsers(ids, limit) {
  limit = limit || LIMIT
  // chunk into batches for the API
  const batches = batcher(ids, limit)
  const ee = new stream()

  function emitData(obj) {
    return ee.emit('data', obj)
  }

  (function loop(ids) {
    if (!ids.length)
      return ee.emit('end')

    ee.emit('batch', ids[0], ids[ids.length-1])

    const opts = { user_id: ids.join(',') }
    client.get(PATH, opts, handleResponse)

    function handleResponse(err, users) {
      if (err)
        return ee.emit('error', err)
      users.forEach(emitData)
      return loop(batches.next())
    }

  })(batches.next())

  return ee
}
