const { Noty } = require('../types/models')

module.exports = {
  method: 'on',
  handler: async function ({ bot, payload }) {
    const [oldPresence, newPresence] = payload
    if (oldPresence?.status == newPresence?.status) return

    const { userId, status } = newPresence

    const noties = await bot.Db().getNotiesByTriggerUserId(userId)
    if (!noties.length) return

    const triggerUser = await bot.getUser(userId)
    if (!triggerUser) return

    const { username, discriminator } = triggerUser

    for (const noty of noties) {
      const notyModel = new Noty(noty)
      if (!notyModel.hasMode(status)) continue

      const { notifiedUserId: userId } = noty
      const suffix = discriminator ? `#${discriminator}` : ''
      const message = `${username}${suffix} is now ${status}`

      try {
        await bot.sendDM({ userId, message })
      } catch (error) {
        console.error(
          `Failed to notify ${userId} of ${userId}'s ${status}:`,
          error
        )
      }
    }
  },
}
