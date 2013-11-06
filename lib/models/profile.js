const db = require('./db')

const profile = db.registerTable('profile', {
  primaryKey: 'screen_name',
  fields: ['screen_name', 'bio', 'picture']
})

module.exports = profile
