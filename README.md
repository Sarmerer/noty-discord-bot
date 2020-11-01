![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/sarmerer/stalker-discord-bot)
![Discord Shield](https://discordapp.com/api/guilds/772146400792281128/widget.png?style=shield)
![GitHub](https://img.shields.io/github/license/sarmerer/stalker-discord-bot)

- [Getting Started](#getting-started)
      - [Requirements](#requirements)
  - [Windows](#windows)
  - [Linux](#linux)
- [Commands](#commands)
- [Flags](#flags)

# Getting Started
#### Requirements
* Discord bot [token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

⚠️ Be careful and don't publish your token anywhere!
* [Node.js](https://nodejs.org) v12.0.0, or greater

## Windows

Clone repo / download zip navigate to stalker-discord-bot folder, then create `.env` file in `stalker` subdirectory:

![Failed to laod image](https://github.com/Sarmerer/stalker-discord-bot/blob/master/images/env.png?raw=true)

put `DISCORD_BOT_TOKEN=<YOUR_TOKEN>` into that file.
Then run `npm run start` in your terminal.

## Linux
```bash
git clone https://github.com/sarmerer/stalker-discord-bot.git
cd stalker-discord-bot
make env token="YOUR_TOKEN"
make npm-i
make start
```

# Commands

Note: arguments starting with `?` are optional

```md
//stalk <user> <?timeout> 
```
Start getting notifications, when user goes online.
Timeout lets you set the amount of time, which should pass, before you get next notification. It can be unique for every user you stalk. Default value is 30 seconds.

```md
//destalk <user>
```
Stop getting notifications about a user

```md
//list
```
Show all people you stalk. User get's into the list, even if he is not a member of the guild, from which command was called.

```md
//stalkers
```
Show all people that stalk you. Works just like `//list`
```md
//chan <?channel | ?state>
```
Show current notifications channel, if no argument passed.
Administrators can change notifications channel with `//chan #new-channel`, or disable notifications with `//chan mute`. To enable them back, use `//chan unmute`.
```md
//help
```
Show available commands

# Flags
Flags are just like command arguments, the only difference is that they can be used, even if command not requires any argument.

```js
-d //Example: //help -d
```
Automatically delete command caller's message, after bot's reponse.
It does not delete bot's response, just your message.