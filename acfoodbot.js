const http = require('http')
const Bot = require('messenger-bot')
var mongoose = require('mongoose');
var uristring = "mongodb_uri";

mongoose.connect(uristring, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });

// mongoose.connect('mongodb://localhost/test');
mongoose.Promise = global.Promise;
var foodSchema = mongoose.Schema({
    time: Date,
    username: String,
    type: String,
    location: String,
    pictureURL: String });
var userSchema = mongoose.Schema({
    userID: String });
var Food = mongoose.model('food', foodSchema);
var Users = mongoose.model('users', userSchema);

let bot = new Bot({
  token: 'token',
  verify: 'pw',
  app_secret: 'secret' })

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('postback', (payload, reply, actions) =>
{ if(payload.postback.payload == 'find'){

  // finds past 4 hours of entries
  Food.find({  "time": {$gte: new Date(new Date().getTime()-60*240*1000).toISOString()} }, 'time username type location', function (err, results) {
      if (err) return handleError(err);
      // (results) => { for(var i in results) { if(results.hasOwnProperty(i)){return true; console.log("true")} } return false; console.log('false')}
      if (isEmpty(results)) {
        reply({ text: `no food updates in the past 4 hours :(`});
      } else{
        results.forEach((result, iterator)=>{
            // console.log(result.time.toISOString().substr(11,5));
            var time_since = Math.abs((new Date()-result.time)/60000); // minutes
            if (time_since > 60){
              var time_since_string = `${Math.floor(time_since/60)} hour(s) ${(time_since%60).toString().split('.')[0]} mins ago`
            } else {var time_since_string = `${time_since.toString().split('.')[0]} mins ago`; }
            message = new Array(result.username, " said there was/were ", result.type, " @ ", result.location, " , ", time_since_string);
            // console.log(`finding result #${iterator}`)
            reply({ text: message.join("")}, (err, info) => {});
        })
      }
  })

  } else if (payload.postback.payload == 'share'){

    reply({ text: 'expected format: [food stuff] @ [campus location]'}, (err, info) => {})

  } else if (payload.postback.payload == 'get started'){

    let userID = payload.sender.id.toString()
    // console.log(userID);
    var user = new Users({userID:userID})

    user.save(err => {
      if (err) return console.error(err);
      console.log("saved user particulars successfully");
    })

    reply({ text: "you will be notified of all future food updates"}, (err, info) => {})

  }
  // else if postback = get started, save userID in a new model, so that it can be used to post whenever new food message sent out
})


bot.on('message', (payload, reply) => {

   bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    if(Users.collection.find({userID: {$exists:true, $nin: payload.sender.id.toString() }})) {
      console.log("user already exists in DB")
    } else {
      console.log("user doesn't exist yet, adding");
      let userID = payload.sender.id.toString()
      var user = new Users({userID:userID})
      user.save(err => {
        if (err) return console.error(err);
        console.log("saved user particulars successfully");
      })
      reply({ text: "you will be notified of all future food updates"}, (err, info) => {})
    }

    if (payload.message.text.toLowerCase().includes("find")){
      Food.find({  "time": {$gte: new Date(new Date().getTime()-60*240*1000).toISOString()} }, 'time username type location', function (err, results) {
          if (err) return handleError(err);
          // (results) => { for(var i in results) { if(results.hasOwnProperty(i)){return true; console.log("true")} } return false; console.log('false')}
          if (isEmpty(results)) {
            reply({ text: `no food updates in the past 4 hours :(`});
          } else{
            results.forEach((result, iterator)=>{
                // console.log(result.time.toISOString().substr(11,5));
                var time_since = Math.abs((new Date()-result.time)/60000); // minutes
                if (time_since > 60){
                  var time_since_string = `${Math.floor(time_since/60)} hour(s) ${(time_since%60).toString().split('.')[0]} mins ago`
                } else {var time_since_string = `${time_since.toString().split('.')[0]} mins ago`; }
                message = new Array(result.username, " said there was/were ", result.type, " @ ", result.location, " , ", time_since_string);
                // console.log(`finding result #${iterator}`)
                reply({ text: message.join("")}, (err, info) => {});
            })
          }
      })
    } else if (!payload.message.text.includes("@")){
      reply({text:"to find food, simply message me anything containing the word 'find'"}, (err) => {if (err) throw err;
        console.log("error find reply");
      })
      reply({text:"to share food, do so in the following format: [food stuff] @ [campus location]"}, (err) => {if (err) throw err;
        console.log("error share reply");
      })
    }  else {
      // check location fits one of school locations
      let user_input = payload.message.text.split('@'); // sample message "cookies @ val"
      let type = user_input[0].toLowerCase().trim();
      let location = user_input[1].toLowerCase().trim();
      let nres_locations =["arms", "barrett", "beneski", "chapin", "converse", "cooper", "fayerweather", "frost", "johnson chapel", "keefe", "mcguire life sci", "mead", "merrill", "octagon", "powerhouse", "seeley", "val", "webster"]
      let resid_locations =  ["appleton", "chapman", "drew", "cpratt", "cohan", "garman", "gwayA", "gwayB", "gwayC", "gwayD", "hitchcock", "humphries", "james", "jenkins", "king", "leland", "lipton", "marsh", "mayo", "moore", "mopratt", "morrow", "newport", "north", "plimpton", "porter", "seelye", "seligman", "south", "stearns", "taplin", "tyler", "wieland", "williston"]

      if (nres_locations.includes(location) || (resid_locations.includes(location.slice(0,-1)) && (Number.isInteger(parseInt(location.slice(-1)))))   ){
        let username = (`${profile.first_name} ${profile.last_name}`).toLowerCase()
        let time = Date(payload.time);
        var message_text = `${username} said there was/were ${type} @ ${location} just now`
        var food = new Food({time, location, type, username});

        food.save(err => {
          if (err) return console.error(err);
          console.log("saved successfully");
        })

        var text = "successfully added!!!"
        reply({text}, (err) => {
          if (err) throw err;
          console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
        })

        console.log("trying to print users");
        var entires = Users.collection.distinct('userID').then((results)=>{
          console.log(`${results.length} unique users found: ${results}`);
          for (var i=0;i<results.length;i++){
            bot.sendMessage(results[i], {text:message_text});
          }
        })

      } else {
        var text1 = "invalid location entered"
        var text2 = `valid non res locations are: ${nres_locations.join(", ")}`
        var text3 = `valid res locations are: ${resid_locations.join(", ")}, AND require an accompanying floor number, e.g. james3`
        reply({text:text1}, (err) => {
          if (err) throw err;
        })
        reply({text:text2}, (err) => {
          if (err) throw err;
        })
        reply({text:text3}, (err) => {
          if (err) throw err;
        })
        console.log(`Error messages successfully echoed`);
      }

    }
  })
})

http.createServer(bot.middleware()).listen(process.env.PORT||5000);
console.log(`Echo bot server running at port ${process.env.PORT||5000}.`);
