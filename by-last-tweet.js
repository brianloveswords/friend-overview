const db = require('level')('db')
const map = require('map-stream')

db.createReadStream({
  start: 'user-info-',
  end: 'user-info-\xff',
  valueEncoding: 'json',
}).pipe(map(function (entry, next) {
  const status = entry.value.status

  if (!status) {
    console.log('%s has no statuses?', entry.value.screen_name)
    return next()
  }

  const date = new Date(status.created_at).toISOString()

  entry.key = 'user-by-last-tweet-' + date

  return next(null, entry)
})).pipe(db.createWriteStream({
  valueEncoding: 'json'
}))
