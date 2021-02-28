// Load dependencies
const { client } = require("./client");

const {
  reply,
  respond,
  updateStat,
  parseMessage,
  getStalkersCount,
} = require("./utils");
const { initLogger, log } = require("./logger");
const { notify } = require("./notify");
const strings = require("./strings");

// Load config
const {
  prefix,
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

  let error = initLogger(client.guilds.cache);
  if (error?.error) {
    throw new Error(error.error);
  }
  log(`${client.user.username} is up and running!`);
});
client.on("warn", (warn) => log(warn, { warn: true }));
client.on("error", (error) => log(error, { error: true }));

client.on("message", (message) => {
  if (message.author.bot || !message.guild) return;

  let { command, args, flags } = parseMessage(message);
  if (!client.commands.has(command)) return;

  let handler = client.commands.get(command);
  if (handler.needsArgs && !args.length && handler.usage)
    return reply(message, handler.usage);
  try {
    handler.execute(message, args, flags);
  } catch (error) {
    log(
      `Error: ${error}${
        message?.guild?.name ? ` | On server: [${ng?.name} - ${ng?.id}]` : ""
      }`
    );
    reply(message, strings.commandExecError);
  }
});

client.on("presenceUpdate", (op = { status: "offline" }, np) => {
  notify(client, op, np);
});

client.on("guildCreate", (guild) => {
  if (guild.systemChannelID)
    global.db
      .get("guilds")
      .push({ id: guild.id, channel: guild.systemChannelID, muted: false })
      .write();
  client.users.cache.get(guild.ownerID).send(strings.thankYou);

  updateStat("servers", client.guilds.cache.size);
  log(`joined [${guild.name}]`);
});

client.on("guildDelete", (guild) => {
  global.db.get("guilds").remove({ id: guild.id }).write();
  global.db
    .get("stalkers")
    .remove((s) => s.guildID === guild.id)
    .write();

  updateStat("servers", client.guilds.cache.size);
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

  updateStat("stalkers", getStalkersCount());
});

client.login(token);
