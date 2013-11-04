const db = require('./db')
const getFriends = require('./get-friends')
const getUserStream = require('./get-user-stream')
const friendIndex = db.sublevel('friend-of-user')
const map = require('map-stream')

module.exports = buildFriendIndex

function buildFriendIndex(handle, callback) {
  const specificIndex = friendIndex.sublevel(handle)

  destroyIndex(specificIndex, function (err) {
    if (err) return callback(err)

    getFriends(handle, function (err, ids) {
      if (err) return callback(err)

      getUserStream()
        .pipe(map(filterById(ids)))
        .pipe(map(removeStuff))
        .pipe(specificIndex.createWriteStream())
        .on('error', callback)
        .on('close', callback)
    })
  })
}

function removeStuff(entry, next) {
  const user = entry.value

  delete user.status
  delete user.verified
  delete user.listed_count
  delete user.id_str
  delete user.protected
  delete user.favourites_count
  delete user.utc_offset
  delete user.time_zone
  delete user.geo_enabled
  delete user.status
  delete user.contributors_enabled
  delete user.is_translator
  delete user.profile_background_color
  delete user.profile_background_image_url
  delete user.profile_background_image_https
  delete user.profile_link_color
  delete user.profile_sidebar_border_color
  delete user.profile_sidebar_fill_color
  delete user.profile_text_color
  delete user.profile_text_color
  delete user.profile_use_background_image
  delete user.notifications

  return next(null, entry)
}

function filterById(ids) {
  return function filter(entry, next) {
    if (ids.indexOf(parseInt(entry.key, 10)) == -1)
      return next() // throw out

    return next(null, entry)
  }
}

function destroyIndex(idx, callback) {
  idx.createKeyStream()
    .pipe(map(makeDeleteOp))
    .pipe(friendIndex.createWriteStream())
    .on('error', callback)
    .on('close', callback)
}

function makeDeleteOp(key, next) {
  return next(null, { type: 'del', key: key })
}

function logger(entry, next) {
  console.log('watching', entry.key)
  return next(null, entry)
}

buildFriendIndex.db = friendIndex
