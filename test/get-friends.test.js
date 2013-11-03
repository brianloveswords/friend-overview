const test = require('./')
const getFriends = require('../lib/get-friends')

test('getting friends', function (t) {
  getFriends('brianloveswords', function (err, ids) {
    t.notOk(err, 'should not have an error')
    t.ok(ids, 'should have ids')
    t.ok(ids.length, 'should have more than 0 ids')
    t.end()
  })
})
