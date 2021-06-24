const { default_throttle } = require("./config.json");
const strings = require("./strings");
const { log } = require("./logger");
const { flags } = require("./commands/stalk");

const statusVariants = Object.keys(flags.mode.variants);

// const messages = {
//   offline: (s, t, notag) => `${notag ? "" : `<@${s}>, `}${t} went offline`,
//   online: (s, t, notag) => `${notag ? "" : `<@${s}>, `}${t} is online`,
// };

function shouldNotify(mode = "online", oldPresence, newPresence) {
  const conds = {
    ooo: (o, n) => n !== o && (n === "offline" || n === "online"),
    offline: (o, n) => o !== "offline" && n === "offline",
    online: (o, n) => o !== "online" && n === "online",
    idle: (o, n) => o !== "idle" && n === "idle",
    dnd: (o, n) => o !== "dnd" && n === "dnd",
    any: (o, n) => n !== o,
  };

  const fn = conds[mode];
  if (typeof fn !== "function") return false;
  return fn(oldPresence, newPresence);
}

const notify = (client, oldPresence, newPresence) => {
  if (!statusVariants.includes(newPresence.status)) return;
  let stalkers = global.db
    .get("stalkers")
    .filter((s) => {
      const dateDiff = new Date() - new Date(s.last_notification);
      const debounce = (s.debounce || default_throttle) * 1000;
      return (
        s.target === newPresence.userID &&
        dateDiff >= debounce &&
        newPresence.guild.id === s.guildID
      );
    })
    .value();
  if (!stalkers.length) return;

  let target = client.guilds.cache
    .get(newPresence.guild.id)
    .members.cache.get(newPresence.userID);

  for (s of stalkers) {
    const stalker = client.guilds.cache.get(s.guildID).members.cache.get(s.id);
    if (!stalker) continue;

    const stalkerStatus = stalker.presence.status;
    if ((stalkerStatus === "offline" || stalkerStatus === "dnd") && s.dnd)
      continue;
    if (!shouldNotify(s.mode, oldPresence.status, newPresence.status)) continue;

    const guildInDB = global.db.get("guilds").find({ id: s.guildID }).value();
    if (!guildInDB)
      return client.users.cache
        .get(newPresence.guild.ownerID)
        .send(strings.couldNotSendANotification);

    global.db
      .get("stalkers")
      .find({ id: s.id, target: s.target })
      .assign({ last_notification: new Date() })
      .write();

    if (guildInDB.muted) return;

    const guild = client.guilds.cache.get(guildInDB.id);
    if (!guild) return;

    const channel =
      guild.channels.cache.get(s.channel) ||
      guild.channels.cache.get(guildInDB.channel);
    if (!channel)
      return client.users.cache
        .get(newPresence.guild.ownerID)
        .send(strings.channelMissing);

    const text = `${s.notag ? "" : `<@${s.id}>, `}${
      target.user.username
    } just went \`${newPresence.status}\``;
    //messages[np.status](s.id, target.user.username, s.notag);

    channel.send(text).catch((error) => {
      if (error.code == 50001)
        // Missing Access error
        return client.users.cache
          .get(newPresence.guild.ownerID)
          .send(strings.missingAccess);
      return log(
        `Error: ${error}${
          guild?.name ? ` | On server: [${guild?.name} - ${guild?.id}]` : ""
        }`,
        { error: true }
      );
    });
  }
};

module.exports = { notify };
