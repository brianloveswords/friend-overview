const concat = require('concat-stream')
const map = require('map-stream')
const client = require('./twitter-client')
const db = require('./db')

const LIMIT = 100
const START_FROM = ''

const userIdSub = db.sublevel('friend-ids')
const userInfoSub = db.sublevel('friend-info')

var TOTAL = 0

module.exports = hydrateFriends

function hydrateFriends(fromId, callback) {
  if (typeof fromId == 'function')
    callback = fromId, fromId = null

  getUserStream(fromId)
    .pipe(concat(getDataForUsers))

  function getDataForUsers(users) {
    if (!users || !users.length)
      return callback(null, TOTAL)

    TOTAL += users.length

    const lastUser = users[users.length-1].value;
    console.log('processing %s to %s',
                fromId || 'beginning',
                lastUser)

    const userList = users.map(pluck('value')).join(',')
    client.get('users/lookup', {
      user_id: userList
    }, function (err, usersWithData) {
      if (err)
        return callback(err)

      const ops = usersWithData.map(makeBatchOp)
      userInfoSub.batch(ops, nextBatch)
    })

    function nextBatch(err) {
      if (err) throw err
      return hydrateFriends(lastUser, callback)
    }
  }
}

hydrateFriends.db = userInfoSub

// hydrateUsers(START_FROM, function (totalRows) {
//   console.log('inserted %s rows', totalRows)
// })

function makeBatchOp(userWithData) {
  return {
    type: 'put',
    key: userWithData.id,
    value: userWithData,
    valueEncoding: 'json',
  }
}

function pluck(key) {
  return function (o) {
    return o[key]
  }
}

function getUserStream(fromId) {
  const from = fromId
    ? '' + (parseInt(fromId, 10) + 1)
    : ''

  return userIdSub.createReadStream({
    start: from,
    limit: LIMIT
  })
}
