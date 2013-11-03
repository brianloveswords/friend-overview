const test = require('./')
const populateTweets = require('../lib/populate-tweets')

test('populate tweets', function (t) {
  populateTweets(function (err) {
    console.dir(err)
    t.end()
  })
})
