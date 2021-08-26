const prefix = require('#config').get('prefix')

module.exports = {
  name: 'strings',
  thankYou: `Thanks for adding me to your server!

I need a text channel set, where all the notifications will be.
System channel will be used for that, if it exists. But you can change it anytime.
In order to do that go to your server and write \`${prefix}chan #channel\`.

You can contact me on this server, to get help: <https://discord.gg/JB94rhqmVA>`,

  couldNotSendANotification: `I couldn't send a notification.
It seems like notifications channel is not set.
You can set it with \`${prefix}chan #channel\`

You can contact me on this server, to get help: <https://discord.gg/JB94rhqmVA>`,
  missingAccess: `I don't have access to notifications channel, please change it with \`${prefix}chan #channel\`, on your server
  
  You can contact me on this server, to get help: https://discord.gg/JB94rhqmVA`,
  commandExecError: 'there was an error trying to execute that command!',
  channelMissing: `I could not send a notification, because notifications channel wasn't set or got deleted
In order to set a new one go to your server and write \`${prefix}chan #channel\`.

You can contact me on this server, to get help: <https://discord.gg/JB94rhqmVA>`,
}
