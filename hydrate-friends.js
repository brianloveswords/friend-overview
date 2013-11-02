const concat = require('concat-stream')
const map = require('map-stream')
const client = require('./twitter-client')
const db = require('level')('db')

const LIMIT = 100
const START_FROM = ''

function getUserStream(fromId) {
  const from = fromId
    ? '' + (parseInt(fromId, 10) + 1)
    : ''

  return db.createReadStream({
    start: 'user-ids-' + from,
    end: 'user-ids-\xff',
    limit: LIMIT
  })
}

var TOTAL = 0

function hydrateUsers(fromId, callback, _total) {
  if (typeof fromId == 'function')
    callback = fromId, fromId = null


  getUserStream(fromId)
    .pipe(concat(getDataForUsers))

  function getDataForUsers(users) {
    if (!users || !users.length)
      return callback(TOTAL)

    TOTAL += users.length

    const userList = users
      .map(function (o) { return o.value })
      .join(',')

    console.dir(users)

    const lastUser = users[users.length-1].value;

    client.get('users/lookup', {
      user_id: userList
    }, function (err, usersWithData) {
      if (err)
        throw err

      const batchOps = usersWithData.map(function(userWithData) {
        return {
          type: 'put',
          key: keyFromId(userWithData.id),
          value: userWithData,
          valueEncoding: 'json',
        }
      })

      db.batch(batchOps, function (err) {
        if (err) throw err
        return nextBatch()
      })
    })

    function nextBatch() {
      return hydrateUsers(lastUser, callback, users.length)
    }
  }
}

hydrateUsers(START_FROM, function (totalRows) {
  console.log('inserted %s rows', totalRows)
})

function keyFromId(id) { return 'user-info-'+id }
