const { log } = require("./logger");

const modes = ["all", "offline", "online"];

const messages = {
  offline: (s, t) => `<@${s}>, ${t} went offline`,
  online: (s, t) => `<@${s}>, ${t} is online`,
};

const modeCheck = {
  offline: (s) => s === "offline",
  online: (s) => s === "online",
  all: (_) => true,
};

const notify = (client, _, np) => {
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
    if (!modeCheck[s.mode](np.status)) continue;
    
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
    client.guilds.cache
      .get(guild.id)
      .channels.cache.get(guild.channel)
      .send(messages[np.status](s.id, target.user.username))
      .catch((error) => {
        if (error.code == 50001)
          // Missing Access error
          return client.users.cache
            .get(np.guild.ownerID)
            .send(strings.missingAccess);
        return log(error, { error: true });
      });
  }
};

module.exports = { modes, modeCheck, notify };
