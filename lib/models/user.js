const db = require('./mysql')

const user = db.registerTable('user', {
  fields: [
    'id',
    'screen_name',
    'name',
    'location',
    'description',
    'url',
    'follower_count',
    'friends_count',
    'profile_image_url_https'
  ]
})

module.exports = user;
