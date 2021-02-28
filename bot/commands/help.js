const { MessageEmbed } = require("discord.js");
const { prefix } = require("../config.json");
const { respond, reply } = require("../utils");
const { client } = require("../client");
const fs = require("fs");
const { description } = require("./chan");

module.exports = {
  name: "help",
  description: "print list of commands, or get detailedusage of some command",
  arguments: {
    optional: ["command - name of a command you want to get help with"],
  },

  execute(message, args) {
    if (args.length) {
      if (!client.commands.has(args[0]))
        return reply(
          message,
          `\`${args[0]}\` command not found, use \`${prefix}help\` to get a list of commands`
        );
      let command = client.commands.get(args[0]);
      let embed = new MessageEmbed()
        .setColor("#509624")
        .setAuthor(
          `command details: ${command.name}`,
          client.user.displayAvatarURL()
        );

      if (command.description) embed.setDescription(command.description);
      if (command.arguments) addArguments(embed, command.arguments);
      if (command.flags) addFlags(embed, command.flags);
      if (command.examples) addExamples(embed, command.examples);

      return respond(message, embed);
    }

    let commands = [];
    let embed = new MessageEmbed()
      .setColor("#509624")
      .setAuthor(
        `${client.user.username} commands:`,
        client.user.displayAvatarURL()
      );

    const commandFiles = fs
      .readdirSync("./bot/commands")
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`./${file}`);
      commands.push(command.name);
    }
    let joinedCommands = commands.join("`, `");
    embed
      .setDescription(
        `\`${joinedCommands}\`\n\nFor detailed description of a command call \`${prefix}help command\``
      )
      .addField(
        "Still need help?",
        "[Join our support server to ask](https://discord.gg/JB94rhqmVA)"
      );

    respond(message, embed);
  },
};

function addArguments(embed, args) {
  let info = "\n* - required | ? - optional\n";

  let required = "";
  let optional = "";
  if (args?.required?.length) required = `\n* ${args.required.join("\n* ")}\n`;
  if (args?.optional?.length) optional = `\n? ${args.optional.join("\n? ")}\n`;

  if (required || optional)
    embed.addField("Arguments:", `\`\`\`md${info}${required}${optional}\`\`\``);
}

function addFlags(embed, flags) {
  let joinedFlags = "";
  for (flag of Object.entries(flags)) {
    let [, values] = flag;

    let overview = `${values.aliases[0]} - ${values.description}\n`;
    let aliases = `#aliases: ${values.aliases.join(", ")}\n`;
    let defaultValue = `#default: ${values.default}\n`;
    let variants = "";

    if (values.variants) {
      let vars = Object.entries(values.variants);
      variants = `#${values.header}\n` || "#variants:\n";
      for (let i = 0; i < vars.length; i++) {
        const [name, description] = vars[i];
        variants += `${i + 1}. ${name} - ${description}\n`;
      }
    }

    joinedFlags += `${overview}${aliases}${defaultValue}${variants}\n`;
  }

  if (joinedFlags)
    embed.addField("Flags:", `${`\`\`\`md\n${joinedFlags}\`\`\``}`);
}

function addExamples(embed, examples) {
  let valid = "";
  if (examples.valid) {
    let v = examples.valid.join(" - ✔️\n");
    valid = `\n\`\`\`md\nValid:\n${v}  - ✔️\n\`\`\``;
  }
  let invalid = "";
  if (examples.invalid) {
    let i = examples.invalid.join(" - ❌\n");
    invalid = `\n\`\`\`md\nInvalid:\n${i} - ❌\n\`\`\``;
  }

  if (valid || invalid) embed.addField("Examples:", `${valid}${invalid}`);
}
