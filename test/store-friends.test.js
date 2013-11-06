const test = require('./')
const storeFriends = require('../lib/store-friends')

test('store friends', function (t) {
  const db = storeFriends.db
  db.del({}, function (err, meta) {
    storeFriends('brianloveswords', function (err, stats1) {
      storeFriends('brianloveswords', function (err, stats2) {
        t.same(stats1.stored, stats2.skipped)
        t.end()
        storeFriends.db.end()
      })
    })
  })
})
