const { default_throttle } = require("./config.json");
const strings = require("./strings");
const { log } = require("./logger");

const statuses = ["online", "offline"];

const messages = {
  offline: (s, t) => `<@${s}>, ${t} went offline`,
  online: (s, t) => `<@${s}>, ${t} is online`,
};

const modeCheck = {
  offline: (o, n) => o !== "offline" && n === "offline",
  online: (o, n) => o !== "online" && n === "online",
  all: (o, n) => n !== o && (n === "offline" || n === "online"),
};

const notify = (client, op, np) => {
  if (!statuses.includes(np.status)) return;
  let stalkers = global.db
    .get("stalkers")
    .filter((s) => {
      let dateDiff = new Date() - new Date(s.last_notification);
      let debounce = (s.debounce || default_throttle) * 1000;
      return (
        s.target == np.userID &&
        dateDiff >= debounce &&
        np.guild.id == s.guildID
      );
    })
    .value();
  if (!stalkers.length) return;

  let target = client.guilds.cache
    .get(np.guild.id)
    .members.cache.get(np.userID);

  for (s of stalkers) {
    let stalker = client.guilds.cache.get(s.guildID).members.cache.get(s.id);
    if (!stalker) continue;
    let status = stalker.presence.status;
    if ((status === "offline" || status === "dnd") && s.dnd) continue;
    if (!modeCheck[s.mode || "online"](op.status, np.status)) continue;

    let guild = global.db.get("guilds").find({ id: s.guildID }).value();
    if (!guild)
      return client.users.cache
        .get(np.guild.ownerID)
        .send(strings.couldNotSendANotification);

    global.db
      .get("stalkers")
      .find({ id: s.id, target: s.target })
      .assign({ last_notification: new Date() })
      .write();
    if (guild.muted) return;
    let ng = client.guilds.cache.get(guild.id);
    if (!ng) return;
    let channel =
      ng.channels.cache.get(s.channel) || ng.channels.cache.get(guild.channel);
    if (!channel)
      return client.users.cache
        .get(np.guild.ownerID)
        .send(strings.channelMissing);
    channel
      .send(messages[np.status](s.id, target.user.username))
      .catch((error) => {
        if (error.code == 50001)
          // Missing Access error
          return client.users.cache
            .get(np.guild.ownerID)
            .send(strings.missingAccess);
        return log(
          `Error: ${error}${ng?.name ? ` | On server: ${ng?.name}` : ""}`,
          { error: true }
        );
      });
  }
};

module.exports = { modeCheck, notify };
