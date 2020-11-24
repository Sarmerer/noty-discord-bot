const { prefix } = require("./config.json");

module.exports = {
  parseMessage(message) {
    if (!message) return;
    if (message.content.substring(0, prefix.length) != prefix)
      return { args: [], command: "" };
    const split = message.content.slice(prefix.length).trim().split(/ +/);
    let command = split.shift();
    let args = split;
    return { args: args, command: command };
  },
  getUserFromMention(message, mention) {
    if (!mention) return;
    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);
      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }
      return message.guild.members.cache.get(mention);
    }
  },
  getChannelFromMention(message, mention) {
    if (!mention) return;
    if (mention.startsWith("<#") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);
      return message.guild.channels.cache.get(mention);
    }
  },
  reply(message, text, timeout = 5000) {
    message
      .reply(text)
      .then((reply) => reply.delete({ timeout: timeout }))
      .catch((error) => console.log(error));
  },
  respond(message, text) {
    return message.channel.send(text).catch((error) => console.log(error));
  },
};
