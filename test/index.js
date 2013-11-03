const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')

const dbPath = path.join(__dirname, 'db')
rmrf.sync(dbPath)
process.env.DB_PATH = dbPath

module.exports = require('tap').test
