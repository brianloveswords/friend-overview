const db = require('../lib/db')
const storeFriends = require('../lib/store-friends')
const populateTweets = require('../lib/populate-tweets')

const handle = process.argv[2]

if (!handle)
  die('You must pass a valid twitter handle')

storeFriends(handle, function (err, stats) {
  console.log('first pass: %j', stats)
  populateTweets(function (err) {
    if (err) throw err
  })
})

function die(msg) {
  console.error(msg)
  process.exit(1)
}
