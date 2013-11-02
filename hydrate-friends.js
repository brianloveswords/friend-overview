const concat = require('concat-stream')
const map = require('map-stream')
const client = require('./twitter-client')
const db = require('./db')

const LIMIT = 100
const START_FROM = ''

const userIdSub = db.sublevel('user-ids')
const userInfoSub = db.sublevel('user-info')

var TOTAL = 0

function hydrateUsers(fromId, callback) {
  if (typeof fromId == 'function')
    callback = fromId, fromId = null

  getUserStream(fromId)
    .pipe(concat(getDataForUsers))

  function getDataForUsers(users) {
    if (!users || !users.length)
      return callback(TOTAL)

    TOTAL += users.length

    const userList = users.map(pluck('value')).join(',')
    const lastUser = users[users.length-1].value;

    console.log('processing %s to %s',
                fromId || 'beginning',
                lastUser)

    client.get('users/lookup', {
      user_id: userList
    }, function (err, usersWithData) {
      if (err)
        throw err

      const batchOps = usersWithData.map(makeBatchOp)
      userInfoSub.batch(batchOps, nextBatch)
    })

    function nextBatch(err) {
      if (err) throw err
      return hydrateUsers(lastUser, callback)
    }
  }
}

hydrateUsers(START_FROM, function (totalRows) {
  console.log('inserted %s rows', totalRows)
})

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
