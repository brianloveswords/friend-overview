// #TODO: rewrite createWriteStream to take advantage of `put` and `update`

const mysql = require('mysql')
const Stream = require('stream')
const ReadableStream = Stream.Readable
const WriteableStream = Stream.Writable
const extend = require('xtend')
const keys = Object.keys

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'friend_overview',
})

connection.connect()

const cache = { }
const proto = create(connection, {
  connection: connection,

  _tables: {},

  registerTable: function (name, spec) {
    this._tables[name] = spec
    return this.table(name);
  },

  table: function table(name) {
    if (cache[name])
      return cache[name]

    const spec = this._tables[name]

    if (!spec)
      throw new Error('table '+name+' is not registered')

    return (cache[name] = create(this, {
      _table: spec.tableName || name,
      _primary: spec.primaryKey || 'id',
      _fields: spec.fields || [],
      _proto: spec.methods || {},
      row: {}
    }))
  },

  get: function get(cnd, callback) {
    const rowProto = this.rowMethods()
    const query = this.selectQuery({
      table: this._table,
      fields: this._fields,
      conditions: cnd,
      limit: 1
    }, function (err, data) {
      if (err)
        return callback(err)

      return callback(null, create(rowProto, data[0]))
    })
  },

  createReadStream: function createReadStream(opts) {
    opts = opts || {}
    const conn = this.connection
    const fields = this._fields
    const query = this.selectQuery({
      table: this._table,
      fields: opts.fields || this._fields,
      conditions: opts.condition || opts.conditions
    })

    const rowProto = this.rowMethods()
    const stream = new Stream
    stream.pause = conn.pause.bind(conn)
    stream.resume = conn.resume.bind(conn)
    query.on('error', stream.emit.bind(stream, 'error'))
    query.on('end', stream.emit.bind(stream, 'end'))
    query.on('result', function onResult(row) {
      stream.emit('data', create(rowProto, row))
    })

    if (opts.debug)
      console.error(query.sql)

    return stream
  },

  selectQuery: function selectQuery(opts, callback) {
    var str =
      selectStatement(opts.table, opts.fields)
      + whereStatement(opts.conditions);

    if (opts.limit)
      str += ' LIMIT ' + opts.limit

    if (!callback)
      return this.connection.query(str, opts.fields)
    return this.connection.query(str, opts.fields, callback)
  },

  rowMethods: function () {
    return extend(this._proto, this.row)
  },

  put: function (row, callback) {
    const conn = this.connection
    const table = this._table
    const primaryKey = this._primary
    const queryString = 'INSERT INTO '+mysql.escapeId(table)+' SET ?'
    const tryUpdate = primaryKey in row
    const query = conn.query(queryString, [row], handleResult.bind(this))
    const meta = {
      row: row,
      sql: query.sql,
      insertId: null
    }
    function handleResult(err, result) {
      if (err) {
        if (err.code == 'ER_DUP_ENTRY' && tryUpdate)
          return this._update(row, callback)
        return callback(err)
      }

      meta.insertId = result.insertId
      return callback(null, row, meta)
    }
  },

  _update: function (row, callback){
    const conn = this.connection
    const table = this._table
    const primaryKey = this._primary

    const queryString =
      'UPDATE ' + mysql.escapeId(table) +
      ' SET ? WHERE ' + mysql.escapeId(primaryKey) +
      ' = ' + mysql.escape(row[primaryKey]) +
      ' LIMIT 1 '

    const query = conn.query(queryString, [row], handleResult.bind(this))
    const meta = {
      row: row,
      sql: query.sql,
      affectedRows: null
    }
    function handleResult(err, result) {
      if (err)
        return callback(err)
      meta.affectedRows = result.affectedRows
      return callback(null, row, meta)
    }
  },

  createWriteStream: function createWriteStream(opts) {
    opts = opts || {}
    const conn = this.connection
    const table = this._table
    const stream = new WriteableStream

    stream.write = function write(row, callback) {
      const queryString = 'INSERT INTO '+mysql.escapeId(table)+' SET ?'
      const query = conn.query(queryString, [row], handleResult)
      const meta = {
        row: row,
        sql: query.sql,
        insertId: null
      }
      function handleResult(err, result) {
        if (err) {
          if (callback) callback(err)
          return stream.emit('error', err, meta)
        }

        meta.insertId = result.insertId

        stream.emit('row', row, meta)
        stream.emit('meta', meta)
        stream.emit('drain')

        if (callback)
          callback(null, row, meta)
      }

      return false;
    }
    stream.end = function end(row) {
      function done() {
        ['finish', 'close', 'end'].forEach(stream.emit.bind(stream))
      }
      if (row)
        stream.write(row, function (err) {
          // errors will be handled by `write`
          if (!err) done()
        })

      else done()
    }

    return stream
  }
})

module.exports = create(proto, {
  connection: connection
})


function selectStatement(table, fields) {
  return (
      'SELECT '
      + fields.map(mysql.escapeId.bind(mysql)).join(',')
      + ' FROM '+ mysql.escapeId(table)
  )
}

function whereStatement(conditions) {
  var cdnString = ''

  if (!conditions)
    return cdnString

  cdnString += ' WHERE 1=1 AND'

  const where = keys(conditions).map(function (key) {
    var cnd = conditions[key]
    var op = cnd.operation || cnd.op || '='
    if (cnd.value)
      cnd = cnd.value
    return mysql.escapeId(key) + ' '+op+' ' + mysql.escape(cnd)
  })

  cdnString += where.join(' AND ')
  return cdnString
}


function create(proto, obj) {
  return keys(obj).reduce(function (acc, key) {
    return (acc[key] = obj[key], acc)
  }, Object.create(proto))
}
