start:
	cd stalker && npm run start
npm-i:
	cd stalker && npm i
config:
ifndef token
	$(error no token provided. Usage: make config token="your token")
endif
	cd stalker && echo '{ "prefix":"//", "default_debounce":30, "token":"$(token)" }' > config.json