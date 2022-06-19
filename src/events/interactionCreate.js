module.exports = {
  method: 'on',
  handler: async function ({ bot, payload }) {
    const [interaction] = payload
    const { commandName } = interaction

    const command = bot.getCommand(commandName)
    if (!command) {
      return await interaction.reply('Command not found.')
    }

    try {
      await command.execute({ bot, interaction })
    } catch (error) {
      throw new Error(`Failed to execute command: ${error}`)
    }
  },
}
