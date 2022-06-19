const { Command } = require('../types/command')
const {
  CommandBooleanOption,
  CommandStringOption,
} = require('../types/command-options')
const { Noty, NotyModes } = require('../types/models')

const { parseUserMentionSequence } = require('../utils/mentions-parser')

const noty = new Command({
  name: 'noty',
  description: 'Notifies you of a user status change.',

  options: [
    new CommandStringOption({
      name: 'users',
      description: 'Users whose status changes you want to be notified of.',
      required: true,
    }),

    ...NotyModes.available().map((mode) => {
      return new CommandBooleanOption({
        name: `when-${mode}`,
        description: `Notify when user's status changes to ${mode}`,
        required: false,
      })
    }),
  ],

  execute: async ({ interaction, bot }) => {
    const { guild } = interaction
    if (!guild) {
      return interaction.reply('This command can only be used in a server.')
    }

    const guildId = guild.id
    const callee = interaction.user

    const { options } = interaction
    const triggerUsersString = options.getString('users')
    const triggerUsersSnowflakes = parseUserMentionSequence(triggerUsersString)
    const triggerUsers = triggerUsersSnowflakes.map((id) => bot.getUser(id))
    if (!triggerUsers.length) {
      return interaction.reply('You must specify at least one user.')
    }

    const modes = new NotyModes({
      ...NotyModes.available().reduce((acc, mode) => {
        if (options.getBoolean(`when-${mode}`)) {
          acc[mode] = true
        }
        return acc
      }, {}),
    })

    if (!modes.length) {
      return interaction.reply(
        'You must specify at least one mode to notify about.'
      )
    }

    const succeeded = []
    for (const triggerUser of triggerUsers) {
      try {
        const notyModel = new Noty({
          modes,
          guildId,
          triggerUserId: triggerUser.id,
          notifiedUserId: callee.id,
        })

        await bot.Db().addNoty(notyModel)
        succeeded.push(triggerUser.username)
      } catch (error) {
        console.error('Failed to add noty:', error)
      }
    }

    if (!succeeded.length) {
      return interaction.reply('Failed to add noty.')
    }

    interaction.reply(
      `You will now be notified of ${succeeded.join(', ')}'s status changes.`
    )
  },
})

module.exports = {
  command: noty,
}
