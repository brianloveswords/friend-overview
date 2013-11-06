const db = require('./db')

const user = db.registerTable('user', {
  fields: [
    'id',
    'screen_name',
    'name',
    'location',
    'description',
    'url',
    'followers_count',
    'friends_count',
    'profile_image_url_https',
  ]
})

module.exports = user;
