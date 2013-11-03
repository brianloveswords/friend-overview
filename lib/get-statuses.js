const client = require('./twitter-client')

module.exports = getStatuses

function getStatuses(handle, callback) {
  client.get('statuses/user_timeline', {
    screen_name: handle,
    trim_user: true,
    count: 200,
  }, callback)
}
