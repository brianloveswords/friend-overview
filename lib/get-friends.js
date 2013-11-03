const client = require('./twitter-client')

module.exports = getFriends

function getFriends(handle, callback) {
  // TODO: handle users who follow more than 5000 people
  client.get('friends/ids', {
    screen_name: handle
  }, function (err, response) {
    if (err) return callback(err)
    return callback(null, response.ids)
  })
}
