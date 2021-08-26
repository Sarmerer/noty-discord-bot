const use_firebase = require('#config').get('use_firebase')

const db = use_firebase ? require('./firebase') : require('./lowdb')
const requiredMethods = [
  'addGuild',
  'getGuildByID',
  'updateGuild',
  'removeGuild',

  'getStalkByTarget',
  'updateStalk',
  'removeStalk',
  'removeStalkByTarget',

  'filterTargets',

  'getStalksCount',
  'getGuildsCount',
]

const methods = {}

for (const method of requiredMethods) {
  if (typeof db[method] !== 'function') {
    throw new Error(
      `Database method ${method} is not defined or not a function`
    )
  }
  methods[method] = db[method]
}

module.exports = { db, ...methods }
