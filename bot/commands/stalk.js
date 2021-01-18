const { getUserFromMention, reply, respond } = require("../utils");
const { prefix, default_throttle } = require("../config.json");
const { modes } = require("../notify");
const { log } = require("../logger");

module.exports = {
  name: "stalk",
  description: "stalk user",
  usage: `${prefix}stalk @user <-t 30> <-m online | offline | all>`,
  args: true,
  execute(message, args, flags) {
    let member = getUserFromMention(message, args[0]);
    if (!member) return reply(message, `Usage: ${this.usage}`);
    const mode = flags["-m"];
    if (mode && !modes.includes(mode))
      return reply(
        message,
        `${mode} mode not found, available modes: ${modes.join(", ")}`
      );
    let debounce = Number.parseInt(flags["-t"]) || 30;
    if (flags["-t"] && (!debounce || debounce < default_throttle))
      return reply(
        message,
        `timeout should be a number, and can't be less than ${default_throttle} seconds`
      );
    let target = member.user;
    if (target.id == message.author.id)
      return reply(message, "You can't stalk yourself");
    var alreadyStalking = global.db
      .get("stalkers")
      .filter((s) => s.id == message.author.id && s.target == target.id)
      .value();
    if (alreadyStalking.length != 0) {
      reply(
        message,
        `You already stalk that person${
          message.guild.id != alreadyStalking[0].guildID
            ? " on another server"
            : ""
        }`
      );
      return;
    }
    let dnd = args.includes("dnd");
    let d = new Date();
    d.setMinutes(d.getMinutes() - 1);
    let newStalker = {
      id: message.author.id,
      target: target.id,
      guildID: message.guild.id,
      debounce: debounce,
      mode: mode,
      dnd: dnd,
      last_notification: d,
    };
    global.db.get("stalkers").push(newStalker).write();
    respond(
      message,
      `${message.author.username} now stalks ${target.username}. Mode: ${mode}${
        dnd ? ", don't disturb mode in on" : ""
      }`
    );
    log(
      `[${message.author.username}] has started stalking [${target.username}]`
    );
  },
};
