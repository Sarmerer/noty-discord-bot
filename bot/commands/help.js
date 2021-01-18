const { prefix: p } = require("../config.json");
const { respond } = require("../utils");

module.exports = {
  name: "help",
  description: "print help",
  execute(message, _) {
    let text = `\`\`\`md
<> - optional argument

Commands:
${p}stalk @user <-t 30> <-m online | offline | all> <dnd> - start getting notifications, when user goes online
#-t - timeout - default value 30, defines time, which should pass, before the next notification
#-m - mode - default mode is online
#dnd - do not disturb mode, you won't be getting notifications if you are offline or dnd

Modes:
online - get notifications only when user goes online 
offline - get notifications only when user goes offline
all - get notifications when user goes online or offline

#examples:
${p}stalk @Sobuck -m offline dnd - ✔️
${p}stalk @Bot -m all - ✔️
${p}stalk -m offline dnd @Sobuck - ❌
${p}stalk sobuck#1234 - ❌

${p}destalk @user - stop getting notifications, when user goes online
${p}stalkers - show people that stalk you
${p}list - show all people you stalk
${p}chan <#channel> <state> - show current notifications channel, set new, or mute all notifications
#channel - you can set new notifications channel with it, requires administrator permission
#state - variants: mute, unmute. If you want to disable notifications use: ${p}chan mute

#examples:
${p}chan - ✔️
${p}chan #notifications - ✔️
${p}chan mute - ✔️
${p}chan notifications - ❌

${p}help - show this message

Still need help? Ask your question on our official server: https://discord.gg/JB94rhqmVA
\`\`\``;
    respond(message, text);
  },
};
