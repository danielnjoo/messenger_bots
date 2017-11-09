# messenger_bots
Messenger bots I threw together to learn how to use nodeJS/JS **and** build something *relatively* useful. They are all hosted on [heroku](heroku.com). Some great bot frameworks I've used are [boot-bot](https://github.com/Charca/bootbot/) and [messenger-bot](https://github.com/remixz/messenger-bot)-- the former has more functionality, and is more friendly!

## getting started
Excellent [tutorial](https://github.com/jw84/messenger-bot-tutorial) to building a bot and using all the appropriate tools to connect it to Facebook and host it.

## bots

### dadbot
Replies with a Dad joke (definition [here](https://www.urbandictionary.com/define.php?term=Dad%20Joke) via an HTTP request to icanhazdadjoke.com. Thanks [Brett](https://brett.is/) for the API!

### acfoodbot
Share information about free food (type/location) at Amherst College with this bot, and it'll blast everyone who's interacted with it with your message. You can also ask for any updates in the last 4 hours. Uses [mongoose](https://www.npmjs.com/package/mongoose) and a sandbox mLab account to store food info... (it doesn't delete it)
