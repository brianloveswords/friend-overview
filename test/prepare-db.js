const storeFriends = require('../lib/store-friends')

storeFriends('brianloveswords', function (err, stats) {
  if (err) throw err
  console.log(stats, 'for brian')

  storeFriends('slexaxton', function (err, stats) {
    if (err) throw err
    console.log(stats, 'for slex')
  })
})
