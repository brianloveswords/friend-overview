const test = require('./')
const buildFriendIndex = require('../lib/build-friend-index')

test('build indexes', function (t) {
  const handle = 'brianloveswords'
  buildFriendIndex(handle, function (err) {
    t.notOk(err, 'should not have an error')

    const db = buildFriendIndex.db.sublevel(handle)

    const start = Date.now()
    var count = 0;

    console.log('starting valuestream')
    db.createValueStream({valueEncoding: 'binary'})
      .on('data', function (user) {
        count++
        // console.log('%s (%s tweets)', user.screen_name, user.recent_statuses.length)
      })
      .on('close', function () {
        const end = Date.now()
        const diff = end - start
        console.error('valuestream took %s ms', diff)
        t.end()
      })

  })
})
