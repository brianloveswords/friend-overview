const test = require('./')
const getStatuses = require('../lib/get-statuses')

test('getStatuses', function (t) {
  getStatuses('brianloveswords', function (err, statuses) {
    console.dir(statuses)
    t.end()
  })
})
