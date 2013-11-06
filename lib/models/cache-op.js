const db = require('./db')

const cacheOp = db.registerTable('cache', {
  tableName: 'cache_op',
  primaryKey: 'op',
  fields: ['op', 'last_run']
})

cacheOp.row.isStale = function isStale(ttl) {
  var now = Date.now()
  return ((now - this.last_run) / 1000) > ttl
}

cacheOp.isFresh = function isFresh(op, ttl, callback) {
  this.isStale(op, ttl, function (err, stale) {
    if (err) return callback(err)
    return callback(null, !stale)
  })
}

cacheOp.isStale = function isStale(op, ttl, callback) {
  this.get({ op: op }, function (err, row) {
    if (err)
      return callback(err)

    return callback(null, row.isStale(ttl))
  })
}

cacheOp.update = function update(op, callback) {
  this.put({ op: op, last_run: new Date() }, callback)
}

module.exports = cacheOp
