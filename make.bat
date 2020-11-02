@ECHO OFF
cd "./stalker"
ECHO Installing dependencies...
CALL npm i
ECHO Done.
ECHO Starting the bot...
CALL node .
PAUSE