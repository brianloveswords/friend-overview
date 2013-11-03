const map = require('map-stream')
const userDb = require('./db').sublevel('user')
const limiter = require('./rate-limiter')

const getStatuses = limiter(require('./get-statuses'), {
  window: 60 * 15,
  limit: 179
})

const TTL = 1000 * 60 * 60 * 24 // 1 day

module.exports = populateTweets

function populateTweets(callback) {
  var globalError;

  const writeStream =
    userDb.createWriteStream({valueEncoding: 'json'})

  const readStream =
    userDb.createReadStream({valueEncoding: 'json'})


  const errorCallback = function (error) {
    if (globalError) return
    globalError = error
    readStream.destroy()
    callback.apply(null, arguments)
  }

  const successCallback = function() {
    if (globalError) return
    callback.apply(null, arguments)
  }

  readStream
    .pipe(map(updateUser))
    .pipe(writeStream)
    .on('close', successCallback)

  function updateUser(entry, next) {
    const user = entry.value

    if (globalError)
      return next()

    const lastUpdate = user.recent_statuses_last_updated || 0
    const now = Date.now()

    if (lastUpdate + TTL > now ) {
      const isoString = new Date(lastUpdate).toISOString()
      console.error('skipping %s (last updated %s)', user.screen_name, isoString)
      return next()
    }

    getStatuses(user.screen_name, function (err, statuses) {
      if (err) return errorCallback(err)
      console.error('processing %s [%s tweets]...', user.screen_name, statuses.length)
      user.recent_statuses = statuses
      user.recent_statuses_last_updated = Date.now()
      return next(null, entry)
    })
  }
}
