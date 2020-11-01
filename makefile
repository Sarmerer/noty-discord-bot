start:
	cd stalker && npm run start
npm-i:
	cd stalker && npm i
env:
ifndef token
	$(error error)
endif
	cd stalker && echo "DISCORD_BOT_TOKEN=$(token)" > .env