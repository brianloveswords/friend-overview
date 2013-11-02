const db = require('./db')
const JSONStream = require('JSONStream')
const sub = db.sublevel('user-by-last-tweet')

console.log('users\n-------------------')

sub.createReadStream({valueEncoding: 'json'})
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout)
