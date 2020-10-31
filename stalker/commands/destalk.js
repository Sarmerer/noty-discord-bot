const { getUserFromMention, reply, respond } = require("../utils/utils");

module.exports = {
  name: "destalk",
  description: "stop stalking a user",
  usage: "`//destalk <user>`",
  args: true,
  execute(message, args) {
    let member = getUserFromMention(message, args[0]);
    if (!member) {
      reply(message, `Usage: ${this.usage}`);
      return;
    }
    let target = member.user;
    global.db
      .get("stalkers")
      .remove((s) => s.id == message.author.id && s.target == target.id)
      .write();
    respond(
      message,
      `${message.author.username} not stalking ${target.username} anymore`
    );
  },
};
