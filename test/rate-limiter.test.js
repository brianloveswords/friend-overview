const rateLimit = require('../lib/rate-limiter')
const test = require('tap').test

test('rate limiter', function (t) {
  var first, second, third

  const opts = { window: 60, limit: 180 }
  const getDate = rateLimit(function (callback) {
    process.nextTick(function () { return callback(Date.now()) })
  }, opts)

  getDate(function (date) { first = date; proceed() })
  getDate(function (date) { second = date; proceed() })
  getDate(function (date) { third = date; proceed() })

  var waiting = 3
  function proceed() {
    if (--waiting > 0) return

    const diff1 = second - first
    const diff2 = third - second

    t.notEqual(first, second, 'should not be the same')
    t.ok(diff1 > 300, 'diff1 should be at least 300 ms')
    t.ok(diff2 > 300, 'diff2 should be at least 300 ms')
    t.end()
  }

})
