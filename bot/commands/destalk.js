const {
  getUserFromMention,
  reply,
  respond,
  updateStat,
  getStalkersCount,
} = require("../utils");
const { prefix } = require("../config.json");
const { log } = require("../logger");

module.exports = {
  name: "destalk",
  description: "stop stalking a user",
  usage: `Usage: \`${prefix}destalk @someone\`. Call ${prefix}help ${this.name} for more details.`,
  needsArgs: true,
  arguments: {
    required: ["@someone... - user(s)/bot(s) which you want to destalk"],
  },
  examples: {
    valid: [`${prefix}destalk @Sobuck`, `${prefix}destalk @Bot @Bot1 @Bot2`],
    invalid: [`${prefix}destalkSobuck`],
  },

  execute(message, args) {
    let members = [];

    args
      .filter((a) => a.match(/^<@[!|&]?[0-9]+>$/gim))
      .forEach((a) => {
        let m = getUserFromMention(message, a);
        if (m?.user) members.push(m.user);
      });

    if (!members.length) {
      reply(message, this.usage);
      return;
    }

    let targets = [];

    for (member of members) {
      if (
        global.db
          .get("stalkers")
          .filter((s) => s.id == message.author.id && s.target == member.id)
          .value().length
      )
        targets.push(member.username);

      global.db
        .get("stalkers")
        .remove((s) => s.id == message.author.id && s.target == member.id)
        .write();
    }

    if (!targets.length)
      return reply(message, "you have not been stalking anyone in the list");

    let stalker = message.author.username,
      stalked =
        targets.length <= 1
          ? `${targets.join("")}`
          : `${targets.slice(0, -1).join(", ")} and ${targets.slice(-1)}`,
      server = message?.guild?.name || undefined;

    respond(message, `${stalker} not stalking ${stalked} anymore`);

    updateStat("stalkers", getStalkersCount());
    log(`[${stalker}] has stopped stalking [${stalked}] on server [${server}]`);
  },
};
