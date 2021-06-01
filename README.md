![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/sarmerer/stalker-discord-bot)
[![Support](https://discordapp.com/api/guilds/772146400792281128/embed.png)](https://discord.gg/JB94rhqmVA)
![GitHub](https://img.shields.io/github/license/sarmerer/stalker-discord-bot)

### You can now [invite stalker](https://top.gg/bot/466896345341362176) to your server!

- [Getting Started](#getting-started)
      - [Requirements](#requirements)
  - [Windows](#windows)
  - [Linux](#linux)
  - [Logging](#logging)
- [Commands](#commands)

# Getting Started
#### Requirements
* Discord bot [token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

⚠️ Be careful and don't publish your token anywhere!
* [Node.js](https://nodejs.org) v12.0.0, or greater

## Windows

1. Clone repo / download zip and navigate to stalker-discord-bot
2. Rename `config.example.json` file to `config.json` and put your discord bot token into that file.
3. Run `make.bat` by double clicking it.

## Linux

1. Clone the repo `git clone https://github.com/sarmerer/stalker-discord-bot.git`
2. Rename `config.example.json` to `config.json` and put your token there
3. Run the bot `cd stalker-discord-bot && make cold-start`

## Logging
If you want your bot to log bot events/monitor stats - change needed key-value pairs in `config.json`

* `home_server` - ID of aserver where the logs/stats will be
* `home_server_servers_stat` - ID of a voice channel, name of which will indicate amount of servers with Stalker Bot
* `home_server_stalkers_stat` - ID of a voice channel, name of which will indicate amount of stalkers
* `home_server_logs_channel` - ID of a channel for bot events logs

Still need help? Get it on bot's [discord server](https://discord.gg/JB94rhqmVA)

# Commands
<> - optional argument

```
//stalk @user <-t 30> <-m online | offline | all> <dnd> - start getting notifications, when user goes online
#-t - timeout - default value 30, defines time, which should pass, before the next notification
#-m - mode - default mode is online
#dnd - do not disturb mode, you won't be getting notifications if you are offline or dnd

Modes:
online - get notifications only when user goes online 
offline - get notifications only when user goes offline
all - get notifications when user goes online or offline

#examples:
//stalk @Sobuck -m offline dnd - ✔️
//stalk @Bot -m all - ✔️
//stalk -m offline dnd @Sobuck - ❌
//stalk sobuck#1234 - ❌
```

```
//destalk @user - stop getting notifications, when user goes online
```
```
//stalkers - show people that stalk you
```
```
//list - show all people you stalk
```
```
//chan <#channel> <state> - show current notifications channel, set new, or mute all notifications
#channel - you can set new notifications channel with it, requires administrator permission
#state - variants: mute, unmute. If you want to disable notifications use: //chan mute

#examples:
//chan - ✔️
//chan #notifications - ✔️
//chan mute - ✔️
//chan notifications - ❌
```

```//help - show this message```

Still need help? Ask your question on our official server: https://discord.gg/JB94rhqmVA
