const { SlashCommandBuilder } = require('discord.js')

class CommandOption {
  /**
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.description
   * @param {boolean} options.required
   */
  constructor(options) {
    this.name_ = options.name
    this.description_ = options.description
    this.required_ = options.required
    this.type_ = options.type
  }

  toSlashCommand(builder) {
    if (!(builder instanceof SlashCommandBuilder)) {
      throw new Error(
        `builder must be an instance of ${SlashCommandBuilder.name}`
      )
    }

    return this.toSlashCommand_(builder)
  }

  toSlashCommand_(builder) {
    throw new Error('This class is not meant to be used directly.')
  }
}

class CommandUserOption extends CommandOption {
  constructor(options) {
    super(options)
    this.type_ = 'user'
  }

  toSlashCommand_(builder) {
    return builder.addUserOption((input) =>
      input
        .setName(this.name_)
        .setDescription(this.description_)
        .setRequired(this.required_)
    )
  }
}

class CommandBooleanOption extends CommandOption {
  constructor(options) {
    super(options)
    this.type_ = 'boolean'
  }

  toSlashCommand_(builder) {
    return builder.addBooleanOption((input) =>
      input
        .setName(this.name_)
        .setDescription(this.description_)
        .setRequired(this.required_)
    )
  }
}

class CommandStringOption extends CommandOption {
  /**
   * @param {object} options
   * @param {Array<Object<name: string, value: string>>} options.choices
   */
  constructor(options) {
    super(options)
    this.type_ = 'string'
    this.choices_ = options.choices || []
  }

  toSlashCommand_(builder) {
    return builder.addStringOption((input) => {
      input
        .setName(this.name_)
        .setDescription(this.description_)
        .setRequired(this.required_)

      if (this.choices_.length > 0) {
        input.addChoices(...this.choices_)
      }

      return input
    })
  }
}

module.exports = {
  CommandOption,
  CommandUserOption,
  CommandBooleanOption,
  CommandStringOption,
}
