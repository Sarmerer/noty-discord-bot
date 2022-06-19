module.exports = {
  method: 'on',
  handler: async function ({ bot }) {
    bot.Db().onGuildCreate()
  },
}
