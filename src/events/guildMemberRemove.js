module.exports = {
  method: 'on',
  handler: async function ({ bot, payload }) {
    for (const event of payload) {
      const { user } = event
      await bot.Db().removeUserRelatedData(user.id)
    }
  },
}
