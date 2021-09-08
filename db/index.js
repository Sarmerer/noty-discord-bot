const use_firebase = require('#config').get('use_firebase')

const { db, methods } = use_firebase
  ? require('./firebase')
  : require('./lowdb')
console.info('[db]', 'Using', use_firebase ? 'Firebase' : 'LowDB')

const requiredMethods = [
  'addGuild',
  'getGuildById',
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

// const methods = {}

// for (const method of requiredMethods) {
//   if (typeof db[method] !== 'function') {
//     throw new Error(
//       `Database method ${method} is not defined or not a function`
//     )
//   }
//   methods[method] = db[method]
// }

module.exports = { db, methods }
