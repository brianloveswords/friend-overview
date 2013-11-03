const test = require('./')
const hydrateFriends = require('../lib/hydrate-friends')
const getFriends = require('../lib/get-friends')
const concat = require('concat-stream')

test('hydrate friends', function (t) {
  getFriends('brianloveswords', function (err, ids) {

    hydrateFriends(ids.sort())
      .on('batch', function (start, end) {
        console.log('start %s end %s', start, end)
      })
      .pipe(concat(done))

    function done(users) {
      t.same(ids.length, users.length, 'should have same amount of users')
      t.end()
    }

  })
})
