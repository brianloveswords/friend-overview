const db = require('level')('db')
const JSONStream = require('JSONStream')

console.log('users\n-------------------')

db.createReadStream({
  start: 'user-info-',
  end: 'user-info-\xff',
  valueEncoding: 'json'
}).pipe(JSONStream.stringify(false))
  .pipe(process.stdout)
