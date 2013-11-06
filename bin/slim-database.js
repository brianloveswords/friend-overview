const db = require('../lib/db').sublevel('user')
const map = require('map-stream')

const userFields = [
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

const statusFields = [
  'id',
  'text',
  'truncated',
  'in_reply_to_status_id',
  'in_reply_to_screen_name',
]

db.createReadStream().pipe(map(function (entry, next) {
  const user = entry.value
  entry.value = onlyFields(user, userFields)

  entry.value.recent_statuses =
    entry.value.recent_statuses.map(function (status){
      return onlyFields(status, statusFields)
    })

  return next(null, entry)
})).pipe(db.createWriteStream())
  .on('close', function () {
    console.log('done')
  })


function onlyFields(obj, fields) {
  return fields.reduce(function (acc, field) {
    acc[field] = obj[field]
    return acc
  }, {})
}
