const db = require('../lib/models/db')
const friends = require('../lib/models/friendship')
const cache = require('../lib/models/cache-op')
const users = require('../lib/models/user')
const profile = require('../lib/models/profile')

// users.createKeyStream()
//   .on('data', console.dir.bind(console))

// var instream = friends.createWriteStream({})

// instream.on('error', function (err, row) {
//   console.error('fuck:', err)
//   console.error('row:', row)
// })

// instream.on('row', function (row, meta) {
//   console.dir(row)
//   console.dir(meta)
// })

// // instream.pipe(through(function (row, meta) {
// //   console.dir(meta)
// // }))

// process.nextTick(function () {
//   instream.write({ screen_name: 'brianloveswords', friend: 1 })
//   instream.write({ screen_name: 'brianloveswords', friend: 1100 })
//   instream.end()


// })

// const outstream = friends.createReadStream({
//   debug: true,
//   condition: {
//     screen_name: 'brianloveswords',
//     friend: { value: 1100, op: '=' }
//   }
// })

// outstream.on('data', function (row) {
//   console.log('row', row.isJerk())
//   console.log('row', row.hifive())
// })

// cache.isFresh('getFriends', 600, function (err, fresh) {
//   console.dir(fresh)
// })

// cache.update('getFriends', function (err, row, meta) {
//   console.error('row', row)
//   console.error('meta', meta)

//   db.end()
// })

var count = 0
friends.createReadStream({}, {
  debug: true,
  relationships: {
    profile: {
      table: 'profile',
      type: 'hasOne',
      foreign: 'screen_name',
      from: 'screen_name',
      optional: true,
    },
    friend: {
      table: 'user',
      type: 'hasMany',
      foreign: 'id',
      pivot: 'screen_name',
    }
  }
}).on('data', function (row, rel) {
  console.dir(row.profile)
  console.dir(row.friend.length)
}).on('end', function () {
  console.log('got', count, 'rows')
  friends.end()
})
