const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./stalkers.json')
const db = lowdb(adapter)
db.defaults({ stalkers: [], guilds: [] }).write()

const methods = require('./methods')

module.exports = { db, methods }
