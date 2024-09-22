const { SlashCommandBuilder } = require('discord.js')
const { Interaction } = require('discord.js')
const { CommandOption } = require('./command-options')

class Command {
  /**
   *
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.description
   * @param {CommandOption[]} options.options
   * @param {Command[]} options.subcommands
   * @param {function} options.execute
   *
   * @returns {Command}
   */
  constructor(options) {
    /** @type {string} */
    this.name = options.name

    /** @type {string} */
    this.description = options.description

    /** @type {Map<string, Command>} */
    this.subcommands = new Map()

    /** @type {CommandOption[]} */
    this.options = new Array()

    if (Array.isArray(options.subcommands)) {
      throw new Error('Subcommands are still under development')

      for (const subcommand of options.subcommands) {
        if (!(subcommand instanceof Command)) {
          console.error(`subcommand must be an instance of ${Command.name}`)
          continue
        }

        subcommand.isSubcommand_ = true
        this.addSubcommand(subcommand)
      }
    }

    if (Array.isArray(options.options)) {
      const sortedOptions = options.options
        .slice()
        .sort((a, b) => b.required_ - a.required_)

      for (const option of sortedOptions) {
        if (!(option instanceof CommandOption)) {
          console.error(`option must be an instance of ${CommandOption.name}`)
          continue
        }

        this.addOption(option)
      }
    }

    if (typeof options.execute === 'function') {
      this.execute = options.execute
    } else {
      throw new Error('execute must be a function')
    }

    return this
  }

  /**
   * @param {Command} subcommand
   * @returns {Command}
   */
  addSubcommand(subcommand) {
    if (!(subcommand instanceof Command)) {
      throw new Error(`subcommand must be an instance of ${Command.name}`)
    }

    this.subcommands.set(subcommand.name, subcommand)
    return this
  }

  /**
   * @param {CommandOption} option
   * @returns {Command}
   */
  addOption(option) {
    if (!(option instanceof CommandOption)) {
      throw new Error(`option must be an instance of ${CommandOption.name}`)
    }

    this.options.push(option)
    return this
  }

  /**
   * @param {object} payload
   * @param {Bot} payload.bot
   * @param {Interaction} payload.interaction
   */
  execute(payload) {
    throw new Error('Not implemented')
  }

  /**
   * @returns {SlashCommandBuilder}
   */
  toSlashCommand() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)

    for (const option of this.options) {
      option.toSlashCommand(builder)
    }

    for (const subcommand of this.subcommands.values()) {
      builder.addSubcommand(subcommand.toSlashCommand())
    }

    return builder
  }
}

module.exports = { Command }
