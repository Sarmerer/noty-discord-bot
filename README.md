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

Still need help? Ask your question on our [official server](https://discord.gg/JB94rhqmVA)
