module.exports = {
  method: 'on',
  handler: async function ({ bot, payload }) {
    await bot.Db().removeGuildRelatedData(payload.id)
    await bot.Db().onGuildDelete()
  },
}
