const { Guild } = require('discord.js')
const { logError } = require('../../src/logger')

module.exports = {
  ping() {},

  /**
   * @param {Guild} guildModel guild data
   */
  addGuild(db, guildModel) {
    if (!(guildModel instanceof Guild))
      return logError('addGuild: guildModel is not an instance of Guild')
    db.get('guilds').push(guildModel).write()
  },
  getGuildById(id) {},
  updateGuild(guildModel) {},
  removeguild(guildId) {},

  getStalk() {},
  updateStalk(stalkModel) {},
  removeStalk(stalkId) {},
}
