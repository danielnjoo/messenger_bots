const https = require('https')
const BootBot = require('bootbot');
const bot = new BootBot({
  accessToken: 'token',
  verifyToken: 'pw',
  appSecret: 'secret'
})

const options = {
  host: 'icanhazdadjoke.com',
  path: '/',
  headers: { 'Accept': 'text/plain', 'User-Agent': 'My Facebook Page (https://www.facebook.com/DadBot-288767724972679/)'}
}

bot.on('message', (payload, chat) => {
  console.log('message received')
  chat.say('~ fetching dad joke ~')
  https.get(options, (res) => {
    joke=[]
   res.on('data', function(d) {
     joke.push(d);
   }).on('end', function() {
     var body = Buffer.concat(joke);
     console.log(body+' echoed');
     chat.say(String(body));
    });
  });
});

bot.start([5000]);
