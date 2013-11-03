const test = require('./')
const hydrateFriends = require('../lib/hydrate-friends')
const getFriends = require('../lib/get-friends')

test('hydrate friends', function (t) {
  getFriends('brianloveswords', function (err, ids) {
    hydrateFriends(function (err, totalRows) {
      t.same(totalRows, ids.length)
      t.end()
    })
  })
})
