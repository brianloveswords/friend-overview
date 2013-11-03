const test = require('./')
const db = require('../lib/db')

const sub = db.sublevel('test-purge')

test('db.purgeDatabase', function (t) {
  t.plan(5)

  sub.batch([
    { type: 'put',  key: 'pizza', value: 'pizza' },
    { type: 'put', key: 'burritos', value: 'burritos' },
    { type: 'put', key: 'tacos', value: 'tacos' },
  ], function (err) {
    if (err) throw err

    sub.get('pizza', function (err, data) {
      t.same(data, 'pizza', 'should have pizza')

      db.put('sandwich', 'ham', function (err) {
        if (err) throw err

        db.purgeDatabase(sub, function () {

          sub.get('pizza', function (err, data) {
            t.ok(err, 'should have an error')
            t.same(err.type, 'NotFoundError', 'should be a `not found` error')
          })

          db.get('sandwich', function (err, data) {
            t.notOk(err, 'should not have an error')
            t.same(data, 'ham', 'should have ham sandwich')
          })
        })

      })
    })
  })


})
