const db = require('./db')

const friendship = db.registerTable('friendship', {
  fields: [
    'id',
    'screen_name',
    'friend'
  ],

  // this works...
  methods: {
    hifive: function hifive() {
      return this.screen_name + ' deserves a hifive!'
    }
  }
})

// ...and so does this
friendship.row.isJerk = function isJerk() {
  return this.screen_name + ' is a jerk!'
}

module.exports = friendship
