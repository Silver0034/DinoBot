//establish constants
//discord.js dependencies
const DISCORD = require('discord.js');
const BOT = new DISCORD.Client();
//npm dependencies
const CHEERIO = require('cheerio');
const FS = require('fs');
const HTTP = require('http');
var jimp = require('jimp');
const MYSQL = require('mysql');
const REQUEST = require('request');
const SCRAPEIT = require("scrape-it");
const VALIDURL = require('valid-url');
// commandFunctions dependencies
const ATTACK = require('./commandFunctions/attack.js');
const BALL = require('./commandFunctions/ball.js');
const JIMPFUNCTIONS =  require('./commandFunctions/jimp.js');
const NPC = require('./commandFunctions/npcGenerate.js');
const PROFANITY = require('./commandFunctions/profanity.js');
const QUOTE = require('./commandFunctions/quote.js');
const ROAR = require('./commandFunctions/roar.js');
const RPG = require('./commandFunctions/rpg.js');
const RPS = require('./commandFunctions/rps.js');
const TASTE = require('./commandFunctions/taste.js');
const TOKENRETURN = require('./token.js');

//establish global variables and constants
const TOKEN = TOKENRETURN.return();
const MYSQLCRED = TOKENRETURN.sqlCredentials;
//make sure to put a space after. Ex:':smile: '
var timedOutUsers = new Array();
var sqldb = MYSQL.createConnection(MYSQLCRED);
var download = function(uri, filename, callback){
  REQUEST.head(uri, function(err, res, body){
    REQUEST(uri).pipe(FS.createWriteStream(filename)).on('close', callback);
  });
};

//global functions
//puts user in timeout
function setUserTimeout(userID, timeoutDuration) {
  //put users userID in a timeout array
  timedOutUsers.push(userID);
  //automatically remove the user from timeout after a set delay
  setTimeout(function() {
    timedOutUsers.splice(timedOutUsers.indexOf(userID), 1);
  }, timeoutDuration);
}
function timeoutAlert(timeoutAlert) {
    //alert users to stop using commands
    //if they are in the timeout array
  return emoji.dino + ' ' + ROAR.generate() + ' *(Slow down, you\'re scaring me!)*  :no_entry_sign:';
}
// timoutDuration is optional. Allows manually passing in a length to time out
function timeout(key, userID, timeoutDuration) {
  //if we have not explicitly set a timeout length in our dictionary, assume we should time out for 6 seconds
  if(timeoutDuration != undefined) {
    setUserTimeout(userID, timeoutDuration);
  } else if(commandDictionary[key].timeout != undefined) {
    setUserTimeout(userID, commandDictionary[key].timeout);
  } else {
    setUserTimeout(userID, 6000);
  }
}
function error(key) {
  var errorMessage = emoji.dino + ' ' + ROAR.generate() + ' ' + ROAR.generate() + ' *(There was an error)*  :no_entry_sign:' + '\n' + commandDictionary[key].error;
  console.log('[FAILED]');
  return errorMessage;
}
function responseHead(message, key, extraContent) { //extraContent is optional
    return emoji.dino + commandDictionary[key].emoji + (extraContent || '') + '| **' + message.author.username + '** | ';
}
function getTime(date) {
  var time;
  
  if (date) time = date;
  else time = new Date();
  
  var hours   = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();
  
  return '[' + hours + ':' + minutes + ':' + seconds + ']';
}
function getDate(date) {
    var time;
    
    if (date) time = date;
    else time = new Date();
    
    var months = time.getMonth() + 1;
    var days = time.getDate();
    var years = time.getFullYear();
    
    return months + '/' + days + '/' + years;
}

var emoji = new Object();
emoji = {
  dino: '<:sauropod:355738679211327488> ',
  str: '<:strength:377677018491387904>',
  dex: '<:dexterity:377677018206175232>',
  con: '<:constitution:377677014561325056>',
  int: '<:intelligence:377677018285998080>',
  wis: '<:wisdom:377677018382204931>',
  cha: '<:charisma:377677013428862978>',
  monster: '<:beholder:386676248434180106>'
}
console.log(emoji);

//dictionary for all commands and information
var commandDictionary = new Object();
commandDictionary['8ball'] = {
  emoji: ':8ball: ', //put space after emoji 
  error: 'Use the command like this: `8ball [question]',
  usage: '**Usage:** `8ball [question]',
  doCommand: function(message, key, args) {
    if (args[0]) {
      message.channel.send(responseHead(message, key) + BALL.generate());
      return;
    } else {
      message.channel.send(error(key));
      return;
    }
  }
};
commandDictionary['roll'] = {
  emoji: ':game_die: ',  //put space after emoji 
  error: 'Use the command like this: `roll [count]d[sides]+/-[modifier]',
  usage: '**Usage:** `roll [count]d[sides]+/-[modifier]',
  doCommand: function (message, key, args) {
    var rollSign = "";
    var rollCount;
    var rollSides;
    var rollOperator;
    var rollList = new Array(); // An array of dice roll values.
    var rollSum = 0; // The sum of all rolls.
    var rollMessageOutput = ""; // The final message to be printed.        
    if (args[0]) {
      if (args[0].includes("+")) {
        rollSign = "+";
      }
      if (args[0].includes("-")) {
        rollSign = "-";
      }     
    }              
    if (args[0]) {
      var rollStat = args[0].replace("+","d").replace("-","d").split("d");
      rollCount = rollStat[0];
      rollSides = rollStat[1];
      rollOperator = rollStat[2];
    } else {
      message.channel.send(error(key));
    }
    // If our inputs are invalid, return an error.
    if (isNaN(rollCount) || isNaN(rollSides) || rollCount <= 0 || rollCount >= 120  || rollSides <= 0 || rollSides >= 120 || rollOperator <= 0 || rollOperator >= 120) {
      message.channel.send(error(key));
      return;
    } else {
      if (isNaN(rollOperator)) {
        rollOperator = ""; 
      }
      // Base message.
      var extraContent = '**' + rollCount + 'd' + rollSides + rollSign + rollOperator + '** '; 
      rollMessageOutput += responseHead(message, key, extraContent);
      // Roll each die.
      for (var i = 0; i < rollCount; i++) {
        var numGen = Math.floor((Math.random() * rollSides) + 1);
        rollSum += numGen;
        rollList.push(numGen);
      }
      rollOperator = Number(rollOperator);
      if (args[0].includes("+")) {
        rollSum = rollSum + rollOperator;
      }
      if (args[0].includes("-")) {
        rollSum = rollSum - rollOperator;
        }
      if (rollCount > 1) {
        // Print all of our rolls
        rollMessageOutput += "```" + rollList.toString() + "```";
      }                            
      rollMessageOutput += " You rolled a total of **" + rollSum + "**"; 
      message.channel.send(rollMessageOutput);
      return;
    }
  }
};
commandDictionary['help'] = {
  icon: 'https://github.com/Silver0034/dinoBot/blob/master/assets/icons/HelpIcon.png?raw=true',
  emoji: ':grey_question: ',  //put space after emoji 
  error: 'Use the command like this: `help',
  usage: '**Usage:** `help OR `help [command]', 
  doCommand: function(message, key, args, embedFooter) {
    var helpMessageBody;
    if(args[0] in commandDictionary) {
      helpMessageBody =  ' ```' + commandDictionary[args[0]].usage + '```';
    } else {
      var helpList = new Array();
    	for (var keyIter in commandDictionary) {
      	helpList.push(keyIter);
      }
      helpMessageBody = '```' + helpList.sort().toString().replace(/,/g, ", ") + '```';
    }
    message.channel.startTyping();
    const embed = new DISCORD.RichEmbed()
      .setTitle('Help')
      .setAuthor(BOT.user.username, BOT.user.avatarURL)
      .setColor(0x64FFDA)
      .setDescription('Commands are formatted as ``[command]`')
      .addField('Command Info', helpMessageBody + '*Do not include brackets' + ' [] ' + 'while using commands*\nUse ``help [command]` to learn more')
      .setFooter(embedFooter)
      .addBlankField(false)
      .setThumbnail(commandDictionary[key].icon);
    message.channel.stopTyping();
    message.channel.send({embed});
    return;
  } 
}; 
commandDictionary['coin'] = {
  emoji: ':moneybag: ',  //put space after emoji  
  error: 'Use the command like this: `coin',
  usage: '**Usage:** `coin',
  doCommand: function(message, key, args) {
    const coinAnswers = [
      'Heads',
      'Tails'
    ];
    function coinGenerator() {
      var coinNum = Math.floor((Math.random() * coinAnswers.length));
      return coinAnswers[coinNum];
    }
    if (args[0]) {
      message.channel.send(error(key));
      return;     
    }    
    message.channel.send(responseHead(message, key) + 'You flipped *' + coinGenerator() + '*');
    return;
  }
};
commandDictionary['attack'] = {
  emoji: ':dagger: ',  //put space after emoji   
  error: 'Use the command like this: `attack [@user OR name]',
  usage: '**Usage:** `attack [@user OR name]',
  doCommand: function(message, key, args) {
    if (args[0] === undefined || args[0] === '' || args[0] == BOT.user) {
    	message.channel.send(error(key));
      return;
    } else {
      message.channel.send(responseHead(message, key) + args[0] + ATTACK.generate());
      return;
    }
  }
};
commandDictionary['choose'] = {
  emoji: ':point_up: ',  //put space after emoji   
  error: 'Use the command like this: `choose [choice1|choice2|etc]',
  usage: '**Usage:** `choose [choice1|choice2|etc]',
  doCommand: function(message, key, args) {
    function chooseGenerator() {
      var chooseNum = Math.floor((Math.random() * chooseArray.length));
      return chooseArray[chooseNum];
    }
    //looks to see if the user input includes string|string
    //if it does not; stops the command and returns error
    //if valid, split the strings into an array    
    if (args[0] && args[0].substring(1, args[0].length - 1).includes('|')) {
      var chooseArray = args[0].split('|');            
    } else {
      message.channel.send(error(key));
      return;
    }
    //if the string|string is valid return output
    //else return error    
    if (chooseArray[0] === '' || chooseArray[1] === '' || chooseArray === null || chooseArray.length <= 1) {
      message.channel.send(error(key));
      return;
    } else {
      message.channel.send(responseHead(message, key) + ' *(I choose ' + chooseGenerator() + '*)');
      return;
    }         
  }
};
commandDictionary['cookie'] = {
  emoji: ':gift: ',  //put space after emoji  
  error: 'Use the command like this: `cookie [@user OR name]',
  usage: '**Usage:** `cookie [@user OR name]',
  doCommand: function(message, key, args) {
    if (!args[0]) {
  		message.channel.send(error(key));
      return;
    } else {
      message.channel.send(responseHead(message, key) + 'You gave ' + args[0] + ' a dino-cookie! :cookie:');
      return;
    }
  }  
};
commandDictionary['error'] = {
  emoji: ':no_entry_sign: ',  //put space after emoji 
  error: 'Use the command like this: `error',
  usage: '**Usage:** `error',
  doCommand: function(message, key, args) {
    message.channel.send(error(key));
  }  
};
commandDictionary['hello'] = {
  emoji: '',  //put space after emoji
  error: 'Use the command like this: `hello',
  usage: '**Usage:** `hello',
  doCommand: function(message, key, args) {
    if (args[0]) {
      message.channel.send(error(key));
      return;
    } else {
      message.channel.send(emoji.dino + ROAR.generate() + ' ' + ROAR.generate() + ' *(Hi ' + message.author.username + ')*');
      return;
    }
  }
};
commandDictionary['ping'] = {
  emoji: ':grey_exclamation: ',  //put space after emoji 
  error: 'Use the command like this: `ping',
  usage: '**Usage:** `ping',
  doCommand: function(message, key, args) {
    if (args[0]) {
      message.channel.send(error(key));
      return;
    } else {
      message.channel.send(emoji.dino + ROAR.generate() + ' ' + ROAR.generate() + ' *(Pong!)*');
      return;
    }
  }      
};
commandDictionary['quote'] = {
  emoji: ':speech_balloon: ',  //put space after emoji 
  error: 'Use the command like this: `quote',
  usage: '**Usage:** `quote',
  doCommand: function(message, key, args) {
    if (args[0]) {
      message.channel.send(error(key));
      return;
    } else {
      message.channel.send(responseHead(message, key) + QUOTE.generate());
      return;
    }
  }
};
commandDictionary['taste'] = {
  emoji: ':fork_and_knife: ',  //put space after emoji 
  error: 'Use the command like this: `taste [@user OR name]',
  usage: '**Usage:** `taste [@user OR name]',
  doCommand: function(message, key, args) {
    if (!args[0]) {
      message.channel.send(error(key));
      return;
    } else {
      message.channel.send(responseHead(message, key) + 'I think ' + args[0] + ' TASTEs ' + TASTE.generate());
      return;
    }
  }
};
commandDictionary['say'] = {
  timeout: 0,
  error: 'Use the command like this: `say [message]',
  usage: '**Usage:** `say [message]',
  doCommand: function(message, key, args) {
    var sayMessage = emoji.dino + message.content.substring(5);     
    message.delete(0); //deletes message  
    if (!args[0]) {
      message.channel.send(error(key));
      return;
    } else {    
      message.channel.send(sayMessage);
      return;
    }
  }
};
commandDictionary['avatar'] = {
  timeout: 12000,
  emoji: ':busts_in_silhouette: ',    
  error: 'Use the command like this: `avatar [target]',
  usage: '**Usage:** `avatar [target]',
  doCommand: function(message, key, args) {
    var avatarMention = message.mentions.users.array();
    var avatarReturn = responseHead(message, key) + '\n'; 
    //if no mentions return sender's avatar  
    if (avatarMention.length < 1) {
      message.channel.send(message.author.username + '\'s Avatar: ' + message.author.avatarURL);
      return;
    } else if (avatarMention.length >= 1 && avatarMention.length <= 5) {
        //if mention range between 1-6 return all avatars
        for (var i = 0; i < avatarMention.length; i++) {
        avatarReturn += avatarMention[i].username + '\'s Avatar: ' + avatarMention[i].avatarURL + "\n";   
      }
      message.channel.send(avatarReturn);
      return;     
    } else {
      //if message range longer than 6 return error
      message.channel.send(error(key) + '\nPlease mention 5 or fewer users.');
      return;
    }
    //if message formatted incorectly  
    message.channel.send(error(key));
    return;      
  }
};
commandDictionary['admin'] = {
  emoji: ':cop: ',
  timeout: 0,
  error: 'Use the command like this: `admin profanity [filter OR nofilter]',
  usage: '**Usage** `admin profanity [filter OR nofilter]',
  doCommand: function(message, key, args) {
    //input: PROFANITY nofilter
    //input: PROFANITY filter
    if(message.author.id == message.guild.owner.id) {
      switch(args[0]) {
        case 'profanity':
          if (args[1] == 'nofilter') {
          	//remove PROFANITY filter from channel
          	sqldb.query("UPDATE channel SET profanityMonitor = 0 WHERE channelID = " + message.channel.id, function (err, results, fields) {
  						if (err) throw err;
              console.log(results);
      			});
            console.log('Removed profanity filter from channel ' + message.channel.name);
            message.channel.send(responseHead(message, key) + 'The profanity filter has been removed from this channel.');
      		} else if (args[1] == 'filter') {
          	//add PROFANITY filter from channel
          	sqldb.query("UPDATE channel SET profanityMonitor = 1 WHERE channelID = " + message.channel.id, function (err, results, fields) {
  						if (err) throw err;
              console.log(results);
      			});
            console.log('Added profanity filter to channel ' + message.channel.name);
            message.channel.send(responseHead(message, key) + 'The profanity filter has been added to this channel.');
      		} else {
            message.channel.send(error(key)); // TODO: append more description later
      		}
          return;
        default:
          message.channel.send(error(key));
          return; // TODO: Consider listing all valid commands
      }
    } else {
      timeout(key, message.author.id, 6000);
      message.channel.send(emoji.dino + 'You do not have access to this command.');
      return;
    }
  }
};
commandDictionary['rps'] = {
  emoji: ':cop: ',
  error: 'Use the command like this: `rps [rock OR paper OR scissors]',
  usage: '**Usage** `rps [rock OR paper OR scissors]',
  doCommand: function(message, key, args) {               
		var rpsMessage = emoji.dino + 'I choose **';
		var rpsWin = '*You win.*';
		var rpsLoose = '*You loose!*';
		var rpsTie = '*We tie.*'
		//check for correct input
		switch(args[0]) {
			case 'rock':
				rpsResult = RPS.generate();
				rpsMessage += rpsResult.toUpperCase() + '** '
				if (rpsResult == 'rock') {
					message.channel.send(rpsMessage + ':right_facing_fist:\n' + rpsTie);
				} else if (rpsResult == 'paper') {
					message.channel.send(rpsMessage + ':raised_back_of_hand:\n' + rpsLoose);
				} else if (rpsResult == 'scissors') {
					message.channel.send(rpsMessage + ':v:\n' + rpsWin);
				}
        break;
			case 'paper':
				rpsResult = RPS.generate();
				rpsMessage += rpsResult.toUpperCase() + '** '
				if (rpsResult == 'rock') {
					message.channel.send(rpsMessage + ':right_facing_fist:\n' + rpsWin);
				} else if (rpsResult == 'paper') {
					message.channel.send(rpsMessage + ':raised_back_of_hand:\n' + rpsTie);
				} else if (rpsResult == 'scissors') {
					message.channel.send(rpsMessage + ':v:\n' + rpsLoose);
				}
        break;
			case 'scissors':
				rpsResult = RPS.generate();
				rpsMessage += rpsResult.toUpperCase() + '** '
				if (rpsResult == 'rock') {
          message.channel.send(rpsMessage + ':right_facing_fist:\n' + rpsLoose);
				} else if (rpsResult == 'paper') {
					message.channel.send(rpsMessage + ':raised_back_of_hand:\n' + rpsWin);
				} else if (rpsResult == 'scissors') {
					message.channel.send(rpsMessage + ':v:\n' + rpsTie);
				}
        break;
      default:
        message.channel.send(error(key));
		}
    return;
	}
};
commandDictionary['monster'] = {
  icon: 'https://github.com/Silver0034/dinoBot/blob/master/assets/icons/dnd-beyond-logo.png?raw=true',
  emoji: emoji.monster,
  error: 'Use the command like this: `rpg name character',
  usage: '**Usage:** `rpg [name | characteristic OR char | bond | flaw | npc | conditions OR con OR c]',
  doCommand: function(message, key, args) {
    
  	switch(args[0]) { 
      case 'monster':
        if (args[1]) {
          console.log(args);
          var scrapeInput = args.join('-').substring(8);
          console.log(scrapeInput);
        } else {
          message.channel.startTyping(); 
          const embed = new DISCORD.RichEmbed()
            .setTitle('Incorrect Format')
            .setAuthor(BOT.user.username, BOT.user.avatarURL)
            .setColor(0x64FFDA)
            .setDescription('Use the command like this: ````rpg monster [monster name]```')
            .setFooter("© 2017 D&D Beyond | Scraped by " + BOT.user.username + '™', "commandDictionary[key].icon")
            .setImage('https://static-waterdeep.cursecdn.com/1-0-6519-15606/Skins/Waterdeep/images/errors/404.png')
            .setThumbnail(commandDictionary[key].icon);
          message.channel.stopTyping();
          message.channel.send({embed});
          return;
        }
        
        message.channel.startTyping();          
        
        var scrapeURL = "https://www.dndbeyond.com/monsters/";
        scrapeURL = scrapeURL + scrapeInput;        
             
        SCRAPEIT(scrapeURL, {
          
          title: ".monster-name",
          descShort: ".details-item",
          // Nested list
          abilityScore: {
            listItem: ".score"
          },
          abilityModifier: {
            listItem: ".modifier"
          },
          quickPrimary: {
            listItem: ".primary"
          },
          quickSecondary: {
            listItem: ".secondary"
          },
          statsTitle: {
            listItem: ".title",
          },
          statsDescription: {
            listItem: ".description",
          },
          strong: {
            listItem: "strong",
          },
          strong: {
            listItem: "strong",
          },
          moreInfoContent: {
            selector: ".more-info-content",
            how: "html"
          },
          moreInfoPlain: {
            selector: ".more-info-content"
          },
          monsterImage: {
            selector: ".monster-image",
            attr: "src"
          },
          errorPageTitle: {
            selector: ".error-page-title",
            how: "text"
          },
        },
          (err, page) => {
          //console.log(err);
          
          if (page.errorPageTitle == 'Page Not Found') {
            const embed = new DISCORD.RichEmbed()
              .setTitle('Monster Not Found')
              .setAuthor(BOT.user.username, BOT.user.avatarURL)
              .setColor(0x64FFDA)
              .setDescription('The Monster you searched for is not on D&D Beyond.')
              .setFooter("© 2017 D&D Beyond | Scraped by " + BOT.user.username + '™', "commandDictionary[key].icon")
              .setImage('https://static-waterdeep.cursecdn.com/1-0-6519-15606/Skins/Waterdeep/images/errors/404.png')
              .setThumbnail(commandDictionary[key].icon);
            message.channel.stopTyping();
            message.channel.send({embed});
            return;
          }
          
          var abilityScoreArray = page["abilityScore"];
          var abilityModifierArray = page["abilityModifier"];
          var quickPrimaryArray = page["quickPrimary"];
          var quickSecondaryArray = page["quickSecondary"];
          var statsTitle = page["statsTitle"];
          var statsDescription = page["statsDescription"];
          var strongArray = page["strong"];
          var moreInfoContent = page["moreInfoContent"] + "";
                
          var proficiencyValue = '';
          var featsLoopArray = moreInfoContent.split('Actions\r\n');
          var featsLoopPlaceholder = featsLoopArray[0];
          var featsValueArray = [];
          var featsValueString = '';
          var actionsValueArray = [];
          var actionsValueString = '';
          var monsterImageURL = page.monsterImage;
          
          
          if (page.monsterImage == undefined) {
            const embed = new DISCORD.RichEmbed()
              .setTitle('Monster Not Available')
              .setAuthor(BOT.user.username, BOT.user.avatarURL)
              .setColor(0x64FFDA)
              .setDescription('I only have acsess to monsters defined by the "basic rules"')
              .setFooter("© 2017 D&D Beyond | Scraped by " + BOT.user.username + '™', "commandDictionary[key].icon")
              .setThumbnail(commandDictionary[key].icon);
            message.channel.stopTyping();
            message.channel.send({embed});
            return;
          }
          
          if (page.monsterImage.includes('https:') == false) {
            monsterImageURL = 'https:' + page.monsterImage;
          }
          
          var quickContent = [];
          
          for (q = 0; q < page.quickPrimary.length; q++) {
            if (page.quickSecondary[q]) {
              quickContent[q] = page.quickPrimary[q] + ' ' + page.quickSecondary[q];
            } else {
              quickContent[q] = page.quickPrimary[q];
            }
            
          }
          
          //This is how many fields are defined in the const
          var fieldCount = 2;
          const embed = new DISCORD.RichEmbed()
            .setTitle(page["title"])
            .setAuthor(BOT.user.username, BOT.user.avatarURL)
            .setColor(0x64FFDA)
            .setDescription(page["descShort"])
            .setFooter("© 2017 D&D Beyond | Scraped by " + BOT.user.username, "commandDictionary[key].icon")
            .setImage(monsterImageURL)
            .setThumbnail(commandDictionary[key].icon)
            .setURL(scrapeURL)
            //Abilities Section          
            .addField("__**Abilities**__",
                      emoji.str + " **" + page.statsTitle[0] + "**: " + page.abilityScore[0] + page.abilityModifier[0] +
                      "  " + emoij.dex + " **" + page.statsTitle[1] + "**: " + page.abilityScore[1] + page.abilityModifier[1] +
                      "  " + emoij.con + " **" + page.statsTitle[2] + "**: " + page.abilityScore[2] + page.abilityModifier[2] + '\n' +
                      emoij.int + " **" + page.statsTitle[3] + "**: " + page.abilityScore[3] + page.abilityModifier[3] +
                      "  " + emoij.wis + " **" + page.statsTitle[4] + "**: " + page.abilityScore[4] + page.abilityModifier[4] +
                      "  " + emoij.cha + " **" + page.statsTitle[5] + "**: " + page.abilityScore[5] + page.abilityModifier[5]
                      , false)
            //Secondary Information
            .addField("__**Secondary Stats**__",
                     "**" + page.statsTitle[6] + "**: " + quickContent[0] + "\n" +
                     "**" + page.statsTitle[7] + "**: " + quickContent[1] + "\n" +
                     "**" + page.statsTitle[8] + "**: " + quickContent[2] + "\n" +
                     "**" + page.statsTitle[9] + "**: " + quickContent[3]
                     , false);
          
          //Proficiency Fields
          for (i = 0; i < page.statsDescription.length; i++) { 
            z = i + 10;
            proficiencyValue += '**' + page.statsTitle[z] + '**: ' + page.statsDescription[i] + "\n"
          }
          embed.addField("__**Proficiencies**__", proficiencyValue, false);
          fieldCount++;
          
          
          //Handles page.moreInfoContent
          var $ = CHEERIO.load(page.moreInfoContent);
          var paragraph = '';
          var lineArray = [];
          var lineSections = [];
          loopParagraph:
            for (i = 0; i < $('p').length; i++) {

              paragraph = $('p').eq(i).html();

              //split each paragraph by line breaks
              lineArray = paragraph.split('<br>');
              //for each line in the paragraph
              loopLine:
                for (j = 0; j < lineArray.length; j++) {
                  //check field number
                  if (fieldCount > 24) { 
                  embed.addField('More at D&D Beyond', 'There is more to this monster. Go to the link above for all of its information.', false);
                  fieldCount++;
                  break loopParagraph;
                  }
                  if (lineArray[j].includes('</strong>')) {
                    lineSections = lineArray[j].split('</strong>');
                    lineSections[0] = lineSections[0].replace('<strong>', '**').replace('.', ':**');
                    lineSections[1] = '<div class=cheerioLoad>' + lineSections[1] + '</div>';
                    var lineSectionsCheerio = CHEERIO.load(lineSections[1]);
                    lineSections[1] = lineSectionsCheerio('.cheerioLoad').text();
                    lineSections[0] = '<div class=cheerioLoad>' + lineSections[0] + '</div>';
                    lineSectionsCheerio = CHEERIO.load(lineSections[0]);
                    lineSections[0] = lineSectionsCheerio('.cheerioLoad').text();
                    //check to make sure it isn't too long
                    if (lineSections[0].length > 1024) {
                      lineSections[1] = lineSections[1].substring(1023) + '…';
                    }
                    //make sure nothing went wrong
                    if (lineSections.length == 2) {
                      //Create Field
                      embed.addField(lineSections[0], lineSections[1], false);
                      fieldCount++; 
                    } 
                  }             
                }
          }
          message.channel.stopTyping();
          message.channel.send({embed});
          return;
        });   
				return;  
			case 'name':
        message.channel.send(responseHead(message, key) + RPG.name());
				return;
			case 'characteristic':
        message.channel.send(responseHead(message, key) + 'The character ' + RPG.characteristics() + '.');
				return;
			c
        message.channel.send(responseHead(message, key) + 'The character is driven by ' + RPG.bonds() + '.');
				return;
			case 'flaw':
        message.channel.send(responseHead(message, key) + 'The character\'s flaw is ' + RPG.flaws() + '.');
				return;
			case 'npc':
        message.channel.send(responseHead(message, key) + RPG.name() + ' is ' + RPG.flavor() + ' that ' + RPG.characteristics() + ', is plagued by ' + RPG.flaws() + ', and is driven by ' + RPG.bonds() + '.');
				return;
      case 'conditions':
			case 'con':
			case 'c':
				if (RPG.rpgConditions[args[1]]) {
					var rpgConditionTitle = args[1].charAt(0).toUpperCase() + args[1].slice(1);
          message.channel.send({embed: {
						color: 0x64FFDA,
						author: {
							name: BOT.user.username,
							icon_url: BOT.user.avatarURL
						},
						title: rpgConditionTitle,
						description: "Note: this condition is for Dungeons and Dragons 5e.\n",
						fields: [
							{
								name: 'Description',
								value: RPG.rpgConditions[args[1]].desc,
							}
						],
						footer: {
								text: BOT.user.username + ' | rpg Assistant'
						}
					}});
					return;
				} else {
          			message.channel.send({embed: {
						color: 0x64FFDA,
						author: {
							name: BOT.user.username,
							icon_url: BOT.user.avatarURL
						},
						title: 'Conditions',
						description: "Note: these conditions are for Dungeons and Dragons 5e.\n",
						fields: [
							{
								name: 'Options',
								value:  RPG.conditionList(),
							},
							{
								name: 'Usage:',
								value: 'Type "`rpg condition" and then the condition you wish to learn more about.'
							}
						],
						footer: {
								text: BOT.user.username + ' | rpg Assistant'
						}
					}});
				return;
				}			
		}
		if (args[0] == null || args[0] == undefined) {
      message.channel.send(error(key) + '\n Options: name, character');
			return;
		} else {
      message.channel.send(responseHead(message, key) + 'Possible rpg commands are name, characteristic, bond, flaw, npc');
			return; 
		}
  }
};
commandDictionary['profile'] = {
  timeout: 0,
	emoji: ':robot: ',
  error: 'Use the command like this: `profile',
  usage: '**Usage:** `profile',
  doCommand: function(message, key, args) {
		if (args[0]) {
			//if there is a first argument
			switch(args[0]) {
				case 'background':
				case 'b':
					if (args[1] != undefined) {
						//if there is a second argument
						//turn https into http
            var imageInputURL = '';
            var imageUrlSplit = args[1].split(':');
            if (imageUrlSplit[0] == 'https') {
							imageUrlSplit[0] = 'http';
						}
						imageInputURL = imageUrlSplit.join(':');
						//check if the argument is a url
						if (VALIDURL.isUri(imageInputURL)) {
							download(imageInputURL, './userContent/userBackground/temp.png');
							//put stuff here
						} else {
							//if the argument is not a url
							message.channel.send(responseHead(message, key) + 'Please use a valid link to an image.');
						}
						break;
					} else {
						//if there is no argument
						message.channel.send(responseHead(message, key) + 'Please use the command as follows:````profile [background OR b] [url-for-the-picture]```Please note that images will be sized to fit over a 800px200px'); 
						break;
					}
			}						
						/*
						//turn https into http
            var imageInputURL = '';
            var imageUrlSplit = args[1].split(':');
            if (imageUrlSplit[0] == 'https') {
							imageUrlSplit[0] = 'http';
						}
						imageInputURL = imageUrlSplit.join(':');
						//what to do if link is added
						if (VALIDURL.isUri(imageInputURL)) {
							//check if image is a png
							HTTP.get(imageInputURL, function(res) {
								var imgCheckBuffer = [];
								var imgCheckLength = 0;
								res.on('data', function(chunk) {
									//store each block of data in imgCheckbuffer
									imgCheckLength += chunk.length;
									imgCheckBuffer.push(chunk);
								})
								res.on('end', function () {
									//puts image from array into single buffer
									console.log(imgCheckBuffer);
									console.log('LOOOOOOK HEEEERRE -----------------------------------------------------------');
									var image = Buffer.concat(imgCheckBuffer);
									//determine if the image is png
									var type = 'image/png';
									if (res.headers['content-type'] !== undefined)
										type = res.headers['content-type'];
									//download the image
									fs.writeFile('./userContent/userBackground/' + message.author.id + '.png', image, function (err) {
										if (err) throw err;
									});
									//Generate path and save path to users
									sqldb.query("UPDATE user SET userBackground = " + MYSQL.escape("./userContent/userBackground/" + message.author.id + ".png") + " WHERE userID = " + message.author.id, function (err, results, fields) {
								if (err) throw err;
    						message.channel.send(responseHead(message, key) + 'Your user background has been updated.');
  						});
								});
							});
						} else {
							message.channel.send(responseHead(message, key) + 'Please use a valid link to an image.');
						}
					} else {
						message.channel.send(responseHead(message, key) + 'Please use the command as follows:````profile [background OR b] [url-for-the-picture]```Please note that images will be sized to fit over a 800px200px window.');	
					}
				return;
			}	*/
		} else {
			//if there is no first argument
			message.channel.startTyping();
					var attachment = '';
					JIMPFUNCTIONS.profile(jimp, 
																message, 
																key, 
																args,
																emoji.dino,
																attachment,
																sqldb);
		}		
	}
};
commandDictionary['nick'] = {
  timeout: 0,
	emoji: ':name_badge: ',
  error: 'Use the command like this: `nick [set OR toggle]',
  usage: '**Usage:** `nick',
  doCommand: function(message, key, args) {
    switch(args[0]) { 
      case 'set':
        if (args[2]) {
          switch(args[1]) {
            case '1':
            case 'one':
              //save args[2] in nickname slot 1
              sqldb.query("UPDATE user SET nicknameOne = " + MYSQL.escape(message.content.substr(12)) + " WHERE userID = " + message.author.id, function (err, results, fields) {
                  if (err) throw err;
                  message.channel.send(responseHead(message, key) + '"' + args[2] + '" has been recorded in name slot 1.\nTo toggle between your two saved nicknames use "`name toggle"');
                });
              return;
            case '2':
            case 'two':
              //save args[2] in nickname slot 2
              sqldb.query("UPDATE user SET nicknameTwo = " + MYSQL.escape(message.content.substr(12)) + " WHERE userID = " + message.author.id, function (err, results, fields) {
                  if (err) throw err;
                  message.channel.send(responseHead(message, key) + '"' + message.content.substr(12) + '" has been recorded in name slot 2.\nTo toggle between your two saved nicknames use "`name toggle"');
                });
              return;
          }
          //if there is no nickname given
          message.channel.send(responseHead(message, key) + 'Please use the command as follows: `name set [1 OR 2] [nickname]');
          return;
        } else {
          //if there is no number selected
          message.channel.send(responseHead(message, key) + 'Please use the command as follows: `name set [1 OR 2] [nickname]');
        }
        return;
      case 'toggle':
        //Switch between two usernames
        //Pull toggle number from database
        sqldb.query("SELECT * FROM user WHERE userID = " + message.author.id, function (err, results, fields) {
		      var nicknameToggleState = results[0].nicknameToggle;
          var nickname = ''; 
          
          if (nicknameToggleState == 0) {
            nickname = results[0].nicknameOne;
            //change the toggle number
            sqldb.query("UPDATE user SET nicknameToggle = 1 WHERE userID = " + message.author.id, function (err, results, fields) {
              //console.log('nickname toggled');
              });
          } else if (nicknameToggleState == 1) {
            nickname = results[0].nicknameTwo;
              //change the toggle number
            sqldb.query("UPDATE user SET nicknameToggle = 0 WHERE userID = " + message.author.id, function (err, results, fields) {
              //console.log('nickname toggled');
            });
          }
  
          //returns message depending on succsess of
          //if statements below the function
          function nicknameResult(nicknameResultVar) {
            if (nicknameResultVar == false) {
                console.log('a fail return; ' + nicknameResultVar);
                message.channel.send(responseHead(message, key) + 'I\'m sorry, I can only change the nickname of users with a lower rank than me');
                return;
              } else {
                console.log('a succeed return; ' + nicknameResultVar);
                message.channel.send(responseHead(message, key) + 'Your nickname has been changed to ' + nickname);
                return;
              }
          }
          if (message.guild) {
            //check BOT has permissions to change nicknames
            if (message.guild.members.get(BOT.user.id).hasPermission("MANAGE_NICKNAMES") && message.guild.members.get(BOT.user.id).hasPermission("CHANGE_NICKNAME")) {
              //change nickname
              //if error make log
              var nicknameResultVar = false;
              message.member.setNickname(nickname).then(function(value) {
                nicknameResultVar = true;
                nicknameResult(nicknameResultVar);
              }, function(reason) {
                nicknameResultVar = false;
                nicknameResult(nicknameResultVar);
              });
              
            } else {
              //If does not have permission
              message.channel.send(responseHead(message, key) + 'I\'m sorry, I do not have permissions to manage nicknames on this server.');
            }
          } else {
            //not in a server (in a DM)
            message.channel.send(responseHead(message, key) + 'I\'m sorry, I can only change your nickname in a server.');
          }
          return;
        });
        
    }
  }
};
commandDictionary['name'] = {
  timeout: 0,
  icon: 'https://github.com/Silver0034/dinoBot/blob/master/assets/icons/NameIcon.png?raw=true',
	emoji: ':thinking: ',
  error: 'Use the command like this: `name [race] [male OR female]',
  usage: '**Usage:** `name [race] [male OR female] [list]',
  doCommand: function(message, key, args, embedFooter) { 
    message.channel.startTyping();
    const embed = new DISCORD.RichEmbed()
                             .setTitle('Name Generator')
                             .setAuthor(BOT.user.username, BOT.user.avatarURL)
                             .setColor(0x64FFDA)
                             .setFooter(embedFooter)
                             .setThumbnail(commandDictionary[key].icon);
    //if race is specified
    if (args[0]) {
      var raceArray = NPC.array();
      var returnGender = ' ';
      var returnDescription = args[0] + '';
      //set male or female for returnGender
      if (args[1] == 'male' || args[1] == 'female') {
        returnGender = returnGender + args[1];
      }
      //make return description a or an
      if (returnDescription.substring(0, 1) == 'a') {
        returnDescription = 'an';
      } else {
        returnDescription = 'a';
      }
      //For each item in the race array
      for (i = 0; i < raceArray.length; i++) {
        //if input is a valid race
        if (raceArray[i] == args[0].toLowerCase()) {
          //if a list is requested
          if (args[2] == 'list' || args[1] == 'list') {
            embed.addField('Names:', '```' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' +
                           NPC.nameFemale(args[0]) + '\n' + '```'
                          );
            embed.setDescription('A list of names for ' + returnDescription + '*** ' + args[0] + returnGender + '***\n*Use the command again for a new name*');
          } else {
            //if a single name is requested
            embed.setDescription('A random name for ' + returnDescription + '*** ' + args[0] + returnGender + '***\n*Use the command again for a new name*');
            //if gender is specified 'female'
            if (args[1] == 'female') {
              embed.addField('Names:', '```' + NPC.nameFemale(args[0]) + '```\n*Add "list" to the end of the command to return a list of names*');
            } else {
              //return male otherwise
              embed.addField('Names:', '```' + NPC.nameMale(args[0]) + '```\n*Add "list" to the end of the command to return a list of names*');
            } 
          }
          embed.addBlankField(false);
          message.channel.stopTyping();
          message.channel.send({embed});
          return;
        }
      }
      //if the specified race is unavailable
      embed
           .setDescription('*The specified race is unavailable*')
           .addField('Possible Races:', NPC.raceList())
           .addBlankField(false);
      message.channel.stopTyping();
      message.channel.send({embed});
      return;
    }
    //if the race is unspecified
    embed
         .setDescription('*Please specify race*```' + commandDictionary[key].usage + '```')
         .addField('Possible Races:', NPC.raceList())
         .addBlankField(false);
    message.channel.stopTyping();
    message.channel.send({embed});
    return;
  }
};
commandDictionary['npc'] = {
  timeout: 0,
  icon: 'https://github.com/Silver0034/dinoBot/blob/master/assets/icons/npcIcon.png?raw=true',
	emoji: ':man_dancing: ',
  error: 'Use the command like this: `npc [class] [race] [gender]',
  usage: '**Usage:** `npc [class] [race] [gender]',
  doCommand: function(message, key, args, embedFooter) { 
    message.channel.startTyping();
    var classArray = NPC.classArray();
    var raceArray = NPC.array();
    var setRace = 'Human';
    var setGender = 'Male';
    var setName = NPC.nameMale('human');
    var setFailState = 0;
    const embed = new DISCORD.RichEmbed()
                             .setTitle('NPC Generator')
                             .setAuthor(BOT.user.username, BOT.user.avatarURL)
                             .setColor(0x64FFDA)
                             .setFooter(embedFooter)
                             .setThumbnail(commandDictionary[key].icon);
    //if gender specified
    if (args[2] != null) {
      if (args[2] == 'female' || args[2] == 'Female') {
        var npcName = NPC.nameFemale;
      }
      setGender = args[2].charAt(0).toUpperCase() + args[2].slice(1).toLowerCase();
    } else {
      var npcName = NPC.nameMale;
    }
    //if class specified
    if (args[0] != null) {          
      for (i = 0; i < classArray.length; i++) {
        //if class is valid
        if (classArray[i] == args[0].toLowerCase()) {
          
          //if race specified
          if (args[1] != null) {
            raceCheck:  
              for (h = 0; h < raceArray.length; h++) {
                if (raceArray[h] == args[1].toLowerCase()) {
                  setRace = raceArray[h].charAt(0).toUpperCase() + raceArray[h].slice(1);
                  setFailState = 0;
                  break raceCheck;
                } else {
                  setFailState = 1;
                }
              }
          }
          //if race is invalid
          if (setFailState == 1) {
            embed
                 .setDescription('Race not found')
                 .addField('Possible NPC Races:', NPC.raceList())
                 .addField('Usage:', '```' + commandDictionary[key].usage + '```')
                 .addBlankField(false);
            message.channel.stopTyping();
            message.channel.send({embed});
            return;
          }
          
          var classInfoArray = NPC.classInfo(args[0].toLowerCase());
          embed
               .setTitle(setName + ': ' + args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase())
               .setDescription(setRace + ' ' + setGender)
               .addField('__**Stats**__', 
                         '**Armor Class:** ' + classInfoArray[0] + '\n' +
                         '**Hit Points:** ' + classInfoArray[1] + '\n' +
                         '**Speed:** ' + classInfoArray[2]
                        )
               .addField('__**Abilities**__', 
                         emoji.str + ': **' + classInfoArray[3] + '**' +
                         emoji.dex + ': **' + classInfoArray[4] + '**' +
                         emoji.con + ': **' + classInfoArray[5] + '**\n' +
                         emoji.int + ': **' + classInfoArray[6] + '**' +
                         emoji.wis + ': **' + classInfoArray[7] + '**' +
                         emoji.cha + ': **' + classInfoArray[8] + '**'
                        )
               .addField('__**Quick Info**__', classInfoArray[9])
               .addField('__**Proficiencies**__', classInfoArray[10])
               .addField('__**Actions**__', classInfoArray[11])
               .addBlankField(false);
          message.channel.stopTyping();
          message.channel.send({embed});
          return;
        }
      }
      embed
           .setDescription('Class not found')
           .addField('Possible NPC Classes:', NPC.classList())
           .addField('Usage:', '```' + commandDictionary[key].usage + '```')
           .addBlankField(false);
      message.channel.stopTyping();
      message.channel.send({embed});
      return;
    }
    embed
         .setDescription('Please specify a class')
         .addField('Possible NPC Classes:', NPC.classList())
         .addField('Usage:', '```' + commandDictionary[key].usage + '```')
         .addBlankField(false);
    message.channel.stopTyping();
    message.channel.send({embed});
    return;
  }
};

//Connect to Database
sqldb.connect(function(err) {
    if (err) throw err;
    console.log('Connected to the Database');
});

//Connect to Discord
// only reacts to Discord _after_ ready is emitted
BOT.on('ready', () => {
  console.log('Online and connected');
});
//try to handle rejections
process.on('unhandledRejection', console.error);

// Create an event listener for messages
BOT.on('message', message => {  
  var messageContent = message.content;
  var messageArguments = message.content.substring(1).split(' ');
  var key = messageArguments[0];
  var args = messageArguments.slice(1);
  var userID = message.author.id;
  
  //Constants that have dependencies
  const embedFooter = BOT.user.username + '™ | Discord.js Bot by Lodes Deisgn';
  
   //delete BOT messages that say to slow down   
  if (message.author.bot && messageContent.includes('Slow down, you\'re scaring me!')) {
    message.delete(6000); //deletes message
    return;
  }
  //stop message from being processed
  //if from a BOT
  if (message.author.bot) { return; }
  
  //if user sends a message
  sqldb.query("INSERT INTO user (userID, username, lastSeen, messagesSent) VALUES (" + userID + ", " + MYSQL.escape(message.author.username) + ", '" + new Date(parseInt(message.createdTimestamp)).toLocaleString() + "', " + "1" + ")" + 
              "ON DUPLICATE KEY UPDATE messagesSent = messagesSent + 1, lastSeen = '" + new Date(parseInt(message.createdTimestamp)).toLocaleString() + "'", function (err, results, fields) {
    if (err) throw err;
    //console.log(results);
  });
  //Set Nicknames
  sqldb.query("SELECT * FROM user WHERE userID = " + message.author.id, function (err, results, fields) {
    if (results[0].nicknameOne == null) {
      sqldb.query("UPDATE user SET nicknameOne = " + MYSQL.escape(message.author.username) + " WHERE userID = " + message.author.id, function (err, results, fields) {
        if (err) throw err;
      });
    }
    if (results[0].nicknameTwo == null) {
      sqldb.query("UPDATE user SET nicknameTwo = " + MYSQL.escape(message.author.username) + " WHERE userID = " + message.author.id, function (err, results, fields) {
        if (err) throw err;
      });
    }
  });
  //console.log(message.author.username + ' updated in database');
  //message processing
	if (message.guild) { //checks if in guild or a DM
		//record message content
  	//note: does not account for daylight savings time
		sqldb.query("INSERT INTO messages (messageID, userID, guildID, channelID, date, content) VALUES (" +
		  message.id  + ", " + message.author.id + ", " + message.guild.id + ", " + message.channel.id + "," +
			"'" + new Date(parseInt(message.createdTimestamp)).toLocaleString() + "', " + MYSQL.escape(message.content) + ")", function (err, results, fields) {
			if (err) throw err;
			//console.log(results);
			//console.log('Logged message by ' + message.author.username);
		});
  //add new channels to channel database
		sqldb.query("INSERT INTO channel (channelID, channelName, serverID) VALUES (" +
			message.channel.id  + ", " + MYSQL.escape(message.channel.name) + ", " + message.guild.id + ")" +
			"ON DUPLICATE KEY UPDATE channelName = " + MYSQL.escape(message.channel.name), function (err, results, fields) {
			if (err) throw err;
			//console.log(results);
			//console.log('Edited channel table: ' + message.channel.name);
		});
		//if message is in PROFANITY enabled channel
		sqldb.query("SELECT * FROM channel WHERE channelID = " + message.channel.id + " AND profanityMonitor = 1", function (err, results, fields) {
			if (err) throw err;
			if (results.length == 1) {PROFANITY.filter(message, emoji.dino, getTime, getDate, userID);}
		}); 
	} else {
		PROFANITY.filter(message, emoji.dino, getTime, getDate, userID);
	}
  //listen for the ` to start a command
  //the BOT only responds with things inside this if
  //if I want the BOT to display something write it in here
  if (messageContent.substring(0, 1) === '`') {
  //stop message from being processed  
  //if from a user in timeout
    if(commandDictionary[key]) {
      if (timedOutUsers.indexOf(userID) > -1) {
        message.channel.send(timeoutAlert());
        console.log(getTime(), message.author.username + ' was warned about spamming commands');
        return;
      }
      //calls for the command function   
      console.log(getTime(), message.author.username + ' used: ' + key);
      //runs function: be sure to message.channel.send in functions that need it
      commandDictionary[key].doCommand(message, key, args, embedFooter);
      timeout(key, userID);
      return;      
    }
    else {
      //TODO: Consider sending the help message
      //console.log(getTime(), message.author.username + " used an unrecognized command input");
      return;    
    }
  }
  if (message.isMentioned(BOT.user)) {
    message.channel.send(emoji.dino + ROAR.generate());     
  }    
  //stop message from being processed
  //if from a BOT
  if (message.author.BOT) { return; }  

});

//define token in the login function
BOT.login(TOKEN);
