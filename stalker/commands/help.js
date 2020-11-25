const { prefix: p } = require("../config.json");
const { respond } = require("../utils");

module.exports = {
  name: "help",
  description: "print help",
  execute(message, _) {
    let text = `\`\`\`md
? - optional argument

Commands:
${p}stalk <user> <?timeout> - start getting notifications, when user goes online
#timeout - default value 30, efines time, which should pass, before the next notification
${p}destalk <user> - stop getting notifications, when user goes online
${p}stalkers - show people that stalk you
${p}list - show all people you stalk
${p}chan <?channel | ?state> - show current notifications channel
#channel - you can set new notifications channel with it, requires administrator permission
#state - variants: mute, unmute. If you want to disable notifications use: ${p}chan mute
${p}help - show this message

Still need help? Ask your question on our official server: https://discord.gg/JB94rhqmVA

\`\`\``;
    respond(message, text);
  },
};
