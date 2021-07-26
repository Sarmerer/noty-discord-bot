const { default_throttle } = require("./config.json");
const strings = require("./strings");
const { log, logError } = require("./logger");
const { flags } = require("./commands/stalk");
const { directMessage } = require("./utils");
const { client } = require("./client");

const statusVariants = Object.keys(flags.mode.variants);

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

const notify = async (oldPresence, newPresence) => {
  if (!statusVariants.includes(newPresence.status)) return;

  let stalkers = global.db
    .get("stalkers")
    .filter((s) => {
      const dateDiff = new Date() - new Date(s.last_notification);
      const debounce = (s.debounce || default_throttle) * 1000;
      return (
        s.target === newPresence.userId &&
        dateDiff >= debounce &&
        newPresence.guild.id === s.guildID
      );
    })
    .value();

  if (!stalkers.length) return;

  let target = await client.users
    .fetch(newPresence.userId)
    .catch((error) => logError(error, newPresence));

  if (!target) return;

  for (s of stalkers) {
    const stalker = await newPresence.guild.members
      .fetch(s.id)
      .catch((error) => logError(error, newPresence));
    if (!stalker) continue;

    const stalkerStatus = stalker.presence.status;
    if ((stalkerStatus === "offline" || stalkerStatus === "dnd") && s.dnd)
      continue;

    if (!shouldNotify(s.mode, oldPresence?.status, newPresence.status))
      continue;

    const guildInDB = global.db.get("guilds").find({ id: s.guildID }).value();
    if (!guildInDB)
      return directMessage(
        newPresence.guild.ownerID,
        strings.couldNotSendANotification
      );

    global.db
      .get("stalkers")
      .find({ id: s.id, target: s.target })
      .assign({ last_notification: new Date() })
      .write();

    if (guildInDB.muted) return;

    const channel = await client.channels
      .fetch(guildInDB.channel)
      .catch((error) => {
        if (error?.httpStatus == 404)
          directMessage(newPresence.guild.ownerId, strings.channelMissing);
        logError(error, newPresence);
      });

    if (!channel) return;

    const text = `${s.notag ? "" : `<@${s.id}>, `}${
      target.username
    } just went \`${newPresence.status}\``;

    channel.send(text).catch((error) => {
      if (error.code == 50001)
        // Missing Access error
        return directMessage(newPresence.guild.ownerId, strings.missingAccess);

      return logError(error, newPresence);
    });
  }
};

module.exports = { notify };
