![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/sarmerer/stalker-discord-bot)
[![Support](https://discordapp.com/api/guilds/772146400792281128/embed.png)](https://discord.gg/JB94rhqmVA)
![GitHub](https://img.shields.io/github/license/sarmerer/stalker-discord-bot)

---

## Table of Contents

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)

# Getting Started

## Requirements

- [Discord bot token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- [Enabled Presence and Server Members intents](https://discord.com/developers/applications/<your-bot-id>/bot)
  - Replace `<your-bot-id>` with an actual bot id
- [Node.js](https://nodejs.org) v18 or greater
- [Git](https://git-scm.com/downloads)

### ⚠️ **Be careful and don't publish your token anywhere!**

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sarmerer/noty-discord-bot.git
   ```

2. **Configure the bot:**

   - Rename `config.example.json` to `config.json`
   - Add your bot token and client ID to `config.json`

   - Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to obtain the necessary tokens.
   - Follow [this guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) to add your bot to servers.
   - **Important:** Ensure that you enable all the necessary intents that are covered in the [requirements](#requirements) section

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the bot:**

   ```bash
   npm run start
   ```

---

## Need help?

Join our [official Discord server](https://discord.gg/JB94rhqmVA) to ask questions!
