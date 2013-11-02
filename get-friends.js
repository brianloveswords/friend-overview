const db = require('./db')
const client = require('./twitter-client')

const sub = db.sublevel('user-ids')

client.get('friends/ids', {
  screen_name: 'brianloveswords'
}, function (err, response) {
  if (err)
    throw err

  const batchOps = response.ids.map(function (id) {
    const key = id
    return { type: 'put', key: key, value: id }
  })

  sub.batch(batchOps, function (err) {
    if (err)
      throw err

    console.log('inserted %s rows', batchOps.length)
  })
})
