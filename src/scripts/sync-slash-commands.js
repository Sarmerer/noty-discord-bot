const { REST, Routes } = require('discord.js');

const { token, clientId } = require('../../config.json')

const fs = require('node:fs')
const path = require('node:path')

const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'))

const commands = []
for (const file of commandFiles) {
  const filePath = path.join('../commands', file)
  try {
    const { command } = require(filePath)
    const slash = command.toSlashCommand()
    commands.push(slash.toJSON())
  } catch (error) {
    throw new Error(`Failed to process ${filePath}: ${error}`)
  }
}

;(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    const rest = new REST({ version: '9' }).setToken(token)
    await rest.put(Routes.applicationCommands(clientId), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
