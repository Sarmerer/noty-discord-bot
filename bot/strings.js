const { prefix } = require("./config.json");

module.exports = {
  name: "strings",
  thankYou: `Thanks for adding me to your server!

I need a text channel set, where all the notifications will be.
System channel will be used for that, if it exists. But you can change it anytime.
In order to do that go to your server and write \`${prefix}chan <channel>\`.`,
  couldNotSendANotification: `I couldn't send a notification.
It seems like notifications channel is not set.

You can set it with \`${prefix}chan <channel>\``,
  missingAccess: `I don't have access to notifications channel, please change it with \`${prefix}chan <channel>\`, on your server`,
  commandExecError: "there was an error trying to execute that command!",
};
