// Load dependencies
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
const { parseMessage, reply, respond } = require("./utils");
const { initLogger, log } = require("./logger");
const strings = require("./strings");

// Load config
const {
  prefix,
  default_throttle,
  token,
  home_server,
  home_server_servers_stat,
  home_server_stalkers_stat,
} = require("./config.json");

// Init database
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("./bot/stalkers.json");
global.db = lowdb(adapter);
global.db.defaults({ stalkers: [], guilds: [] }).write();

// Load bot commads
const fs = require("fs");
const commandFiles = fs
  .readdirSync("./bot/commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  client.user.setActivity(`${prefix}help`, {
    type: "LISTENING",
  });
  initLogger(client.guilds.cache);
  log(`${client.user.username} is up and running!`);
});
client.on("warn", (warn) => log(warn, { warn: true }));
client.on("error", (error) => log(error, { error: true }));

client.on("message", (message) => {
  if (message.author.bot || !message.guild) return;

  let { args, command } = parseMessage(message);
  if (!client.commands.has(command)) return;

  let handler = client.commands.get(command);
  if (handler.args && !args.length && handler.usage)
    return respond(message, handler.usage);
  try {
    handler.needAllGuilds
      ? handler.execute(message, client.guilds)
      : handler.execute(message, args);
  } catch (error) {
    console.error(error);
    reply(message, strings.commandExecError);
  }
});

client.on("presenceUpdate", (op = { status: "offline" }, np) => {
  if (!(np.status == "online" && op.status == "offline")) return;
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
    if (stalker.presence.status == "offline" && s.noOffline) continue;
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
      .send(`<@${s.id}>, ${target.user.username} is online`)
      .catch((error) => {
        if (error.code == 50001)
          // Missing Access error
          return client.users.cache
            .get(np.guild.ownerID)
            .send(strings.missingAccess);
        return log(error, { error: true });
      });
  }
});

client.on("guildCreate", (guild) => {
  if (guild.systemChannelID)
    global.db
      .get("guilds")
      .push({ id: guild.id, channel: guild.systemChannelID, muted: false })
      .write();
  client.users.cache.get(guild.ownerID).send(strings.thankYou);
  log(`joined [${guild.name}]`);
});

client.on("guildDelete", (guild) => {
  global.db.get("guilds").remove({ id: guild.id }).write();
  log(`left [${guild.name}]`);
});

client.on("guildMemberRemove", (member) => {
  global.db
    .get("stalkers")
    .remove(
      (s) =>
        (s.id == member.user.id || s.target == member.user.id) &&
        s.guildID == member.guild.id
    )
    .write();
});

setInterval(() => {
  let guild = client.guilds.cache.get(home_server);
  if (!guild) return;
  let serversChannel = guild.channels.cache.get(home_server_servers_stat);
  if (serversChannel) {
    serversChannel
      .edit({ name: `Servers: ${client.guilds.cache.size}` })
      .catch((error) => log(error, { error: true }));
  }
  let stalkersChannel = guild.channels.cache.get(home_server_stalkers_stat);
  if (stalkersChannel) {
    let stat = global.db
      .get("stalkers")
      .value()
      .filter((v, i, s) => s.indexOf(v) === i).length;
    stalkersChannel
      .edit({ name: `Stalkers: ${stat}` })
      .catch((error) => log(error, { error: true }));
  }
}, 60 * 60 * 1000);

client.login(token);
