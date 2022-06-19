const { Command } = require('../types/command')
const { CommandStringOption } = require('../types/command-options')
const { Noty } = require('../types/models')

const { parseUserMentionSequence } = require('../utils/mentions-parser')

const unNoty = new Command({
  name: 'un-noty',
  description: 'Stops notifying you of a user status change.',

  options: [
    new CommandStringOption({
      name: 'users',
      description: 'Users whose status changes you want to be notified of.',
      required: true,
    }),
  ],

  execute: async ({ interaction, bot }) => {
    const callee = interaction.user

    const { options } = interaction
    const triggerUsersString = options.getString('users')
    const triggerUsersSnowflakes = parseUserMentionSequence(triggerUsersString)
    const triggerUsers = triggerUsersSnowflakes.map((id) => bot.getUser(id))
    if (!triggerUsers.length) {
      return interaction.reply('You must specify at least one user.')
    }

    const succeeded = []
    for (const triggerUser of triggerUsers) {
      try {
        const notyModel = new Noty({
          triggerUserId: triggerUser.id,
          notifiedUserId: callee.id,
        })

        await bot.Db().removeNoty(notyModel)
        succeeded.push(triggerUser.username)
      } catch (error) {
        console.error('Failed to remove noty:', error)
        return interaction.reply('Failed to un-noty.')
      }
    }

    if (!succeeded.length) {
      return interaction.reply('Failed to un-noty.')
    }

    return interaction.reply(
      `You will no longer be notified of ${succeeded.join(
        ', '
      )}'s status changes.`
    )
  },
})

module.exports = {
  command: unNoty,
}
