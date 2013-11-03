const level = require('level')
const sublevel = require('level-sublevel')
const dbPath = process.env.DB_PATH || 'db'
module.exports = sublevel(level(dbPath))
