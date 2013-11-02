const db = require('./db')
const map = require('map-stream')

const userInfoSub = db.sublevel('user-info')
const byTweetSub = db.sublevel('user-by-last-tweet')

userInfoSub.createReadStream({
  valueEncoding: 'json'
}).pipe(map(function (entry, next) {
  const status = entry.value.status

  if (!status) {
    console.log('%s has no statuses?', entry.value.screen_name)
    return next()
  }
  const date = new Date(status.created_at).toISOString()
  entry.key = date + '-' + entry.value.id
  return next(null, entry)
})).pipe(byTweetSub.createWriteStream({
  valueEncoding: 'json'
}))
