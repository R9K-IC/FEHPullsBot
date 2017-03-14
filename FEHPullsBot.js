var Discord = require('discord.io');

// Get auth data for login.
try {
	var auth = require("./auth.json");
} catch (e){
	console.log("No auth.JSON file.\n"+e.stack);
	process.exit();
}

var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

function Focus(_focus) {
    this.focus = _focus;
	this.count = [];
	this.totals = [];
	this.P = [];
	this.EO = [];
	this.probDivTot = [];
	
	//Setup counters.
	/*
		[0] -> Red
		[1] -> Blue
		[2] -> Green
		[3] -> Colorless
		[4] -> Total
		[x][0] -> 3's
		[x][1] -> 4's
		[x][2] -> 5's
		[x][3] -> Focuses
	*/
	for(var i = 0; i < 4; i++){ this.count[i] = []; this.totals[i] = 0; this.P[i] = 0; this.EO[i] = 0; this.probDivTot[i] = 0; for(var j = 0; j < 4; j++){ this.count[i][j] = 0; }}
	this.allProbs = "";
	
	//Initialize all probabilites and store them.
	calcProbs(this);
}

//Accept a Focus object and calculate the correct values for each parameter in the object with the given rarity cache.
function calcProbs(input){
	console.log(input);
	
	for(var j = 0; j < raritiesCache.focus[input.focus].members.length; j++){
		input.count[getCharacterInfo(raritiesCache.focus[input.focus].members[j]).color][3]++;
	}
	
	//Count everything else.
	for(var i = 0; i < 4; i++){
		for(var j = 1; j < rarities[i].length; j++){
			input.count[i][0] += rarities[i][j]._3;
			input.count[i][1] += rarities[i][j]._4;
			input.count[i][2] += rarities[i][j]._5;
		}
		for(var j = 0; j < 4; j++){ input.totals[j] += input.count[i][j]; }
	}
	
	for(var i = 0; i < 4; i++){ input.probDivTot[i] = pull[i] / input.totals[i]; }
	for(var i = 0; i < 4; i++){
		
		for(var j = 0; j < 4; j++){
			input.P[i] += input.count[i][j] * input.probDivTot[j];
			console.log("probs: " + i + " " + input.P[i] + " " + input.count[i][j] + " " + input.probDivTot[j] + " " + input.totals[j]);
		}
		
		var ExpOrb = 0, ExpSum = 0;
		for(var j = 0; j < 6; j++){
			ExpOrb += _5choose[j] * orbCost[j] * Math.pow(1 - input.P[i], 5 - j) * Math.pow(input.P[i], j);
			ExpSum += j * _5choose[j] * Math.pow(1 - input.P[i], 5 - j) * Math.pow(input.P[i], j);
		}
		console.log(colorHash[i] + " " + ExpOrb + " " + ExpSum + " ORBS AND SUMS");
		input.EO[i] = ExpOrb / ExpSum;
	}
	
	//console.log("\nTotal 3: " + total_3 + " | 4: " + total_4 + " | 5: " + total_5 + " | Focus: " + total_F);

	try{
		input.allProbs = "From the " + focusName[input.focus] + " focus: ";
		for(var i = 0; i < colorHash.length; i++){input.allProbs += getProbs(i, input)}
		console.log("");
	}
	catch(e){
		console.log(e.stack);
	}
}

function getCharProb(name, num, focusNum, input){
	try{
		var charInfo = getCharacterInfo(name);
	}catch(e){ throw e; }
	
	var _F = getCharacterFocus(name) == focusNum;
	var color = charInfo.color;
	console.log(charInfo.character);
	console.log(num + " " + input.EO[color] + " " + _F + " " + focusNum + " " + getCharacterFocus(name));
	
	return "From the " + focusName[focusNum] + " focus: " +
			"\n" + charInfo.character.name + " has probability of being pulled from " + colorHash[color] + " orbs with:" +
						"\n\t\t" +		parseToFixedPercent(((	
														(charInfo.character._3 ? input.probDivTot[0] : 0) + 
														(charInfo.character._4 ? input.probDivTot[1] : 0) + 
														(charInfo.character._5 ? input.probDivTot[2] : 0) + 
														(_F ? input.probDivTot[3] : 0)
													) / input.P[color] ), 5) + "% chance to be pulled at any rarity." +
						(charInfo.character._3 ? "\n\t\t" + parseToFixedPercent((input.probDivTot[0] / input.P[color] ), 5) + "% chance at 3 stars." : "") +
						(charInfo.character._4 ? "\n\t\t" + parseToFixedPercent((input.probDivTot[1] / input.P[color] ), 5) + "% chance at 4 stars." : "") +
						(charInfo.character._5 || _F ? "\n\t\t" + parseToFixedPercent((((charInfo.character._5 ? input.probDivTot[2] : 0) + (_F ? input.probDivTot[3] : 0)) / input.P[color] ), 5) + "% chance at 5 stars." : "") +
				(num > 1 ? 
					"\n\tand from " + num + " " + colorHash[color] + " orbs: " +
					"\n\t\t" +		parseToFixedPercent(((1 - (Math.pow (1 - ((
															(charInfo.character._3 ? input.probDivTot[0] : 0) + 
															(charInfo.character._4 ? input.probDivTot[1] : 0) + 
															(charInfo.character._5 ? input.probDivTot[2] : 0) + 
															(_F ? input.probDivTot[3] : 0)) / input.P[color])
													, num))) ), 5) + "% chance to be pulled at any rarity." +
						(charInfo.character._3 ? "\n\t\t" + parseToFixedPercent(((1 - Math.pow(1 - (input.probDivTot[0] / input.P[color]), num)) ), 5) + "% chance at 3 stars." : "") +
						(charInfo.character._4 ? "\n\t\t" + parseToFixedPercent(((1 - Math.pow(1 - (input.probDivTot[1] / input.P[color]), num)) ), 5) + "% chance at 4 stars." : "") +
						(charInfo.character._5 || _F ? "\n\t\t" + parseToFixedPercent(((1 - Math.pow(1 - (((charInfo.character._5 ? input.probDivTot[2] : 0) + (_F ? input.probDivTot[3] : 0)) / input.P[color]), num)) ), 5) + "% chance at 5 stars." : "") +
					"\n\tWith expectation of " + Math.ceil(num * input.EO[color]) + " orbs spent to do so."
				: "");
}


function getProbs(color, input){
	
	if(color > 4 || color < 0){
		throw{
			name: "InvalidColorError",
			message: "Color not found."
		}
	}
	
	console.log(color + ": " + input.count[color][0] + " " + input.probDivTot[0] + " " + input.P[color]);
	//console.log(color + " has 3: " + _3 + " | 4: " + _4 + " | 5: " + _5 + " | Focus: " + _F + " " + _P);
	return "\n" + colorHash[color] + " has: " +
				"\n\t3 stars           : " + parseToFixedPercent((input.count[color][0] * input.probDivTot[0] / input.P[color] ), 5) + "% chance " +
				"\n\t4 stars           : " + parseToFixedPercent((input.count[color][1] * input.probDivTot[1] / input.P[color] ), 5) + "% chance " +
				"\n\t5 stars(Non-Focus): " + parseToFixedPercent((input.count[color][2] * input.probDivTot[2] / input.P[color] ), 5) + "% chance " +
				"\n\t5 stars(Focus)    : " + parseToFixedPercent((input.count[color][3] * input.probDivTot[3] / input.P[color] ), 5) + "% chance " +
				"\n\t5 stars(All)      : " + parseToFixedPercent((input.count[color][2] * input.probDivTot[2] / input.P[color] + input.count[color][3] * input.probDivTot[3] / input.P[color] ), 5) + "% chance ";
}

//Constants
const _5choose = [1, 5, 10, 10, 5, 1], orbCost = [5, 5, 9, 13, 17, 20], colorHash = ["red", "blue", "green", "colorless"], pull = [0.58, 0.36, 0.03, 0.03];
var focusName = [], focusNameHash = [], focus = [], focusMessage = "", rarities = [], raritiesHash = [], ambiguous;

var helpMessage = "Commands:\n"+
					"```\n\t"+
						"~help\n\t\t"+
							"-Displays this message.\n\t"+
						"~[focus] all\n\t\t"+
							"-Displays overall probabilities of all colours & rarities for a particular focus.\n\t"+
						"~[focus] <character name> [number]\n\t\t"+
							"-Displays probabilities of the character given the color and focus.\n\t"+
							"-The number argument is optional, but will tell you approx. probability & cost in orbs.\n\t\t"+
								"ex. ~siblings hector 10.\n\t"+
						"~focus\n\t\t"+
							"-Displays available focuses and their aliases"+
					"```\n";
					
//Setup pulling rarities.
try {
	var raritiesCache = require("./rarities.json");
	
	ambiguous = raritiesCache.ambiguous;
	rarities[0] = raritiesCache.rarities.red;
	raritiesHash[0] = raritiesCache.hash.red;
	rarities[1] = raritiesCache.rarities.blue;
	raritiesHash[1] = raritiesCache.hash.blue;
	rarities[2] = raritiesCache.rarities.green;
	raritiesHash[2] = raritiesCache.hash.green;
	rarities[3] = raritiesCache.rarities.colorless;
	raritiesHash[3] = raritiesCache.hash.colorless;
	
	focusMessage += "Available Focuses are:\n```\n\t";
	for(var i = 1; i < raritiesCache.focus.length; i++){
		focusName[i] = raritiesCache.focus[i].name;
		focusMessage += focusName[i] + ": \n\t\t";
		
		for(var j = 0; j < raritiesCache.focus[i].alias.length; j++){
			focusNameHash[raritiesCache.focus[i].alias[j]] = i;
			focusMessage += raritiesCache.focus[i].alias[j] + (j < raritiesCache.focus[i].alias.length - 1 ? "\n\t\t" : (i < raritiesCache.focus.length - 1 ? "\n\t" : ""));
		}
		
		focus[i] = new Focus(i);
	}
	focusMessage += "```";
} catch (e){
	console.log("No rarities.JSON file.\n"+e.stack);
	process.exit();
}

bot.on("ready", function(event) {
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, event) {

	if(userID == bot.id){return;}
	
	console.log("\n==== New Message ====")
	
	console.log(user + " - " + userID);
	console.log("in " + channelID);
	console.log(message);
	console.log("----------");
	
	if(message.startsWith("~")) {
		var args = message.toLowerCase().split("~")[1].split(" ");
		
		if(args[0] == "help"){
			sendMessages(userID, [helpMessage]);
			return;
		}
		
		if(args[0] == "focus"){
			sendMessages(channelID, [focusMessage]);
			return;
		}
		
		else if(focusNameHash[args[0]] && args[1] == "all"){
			sendMessages(channelID, ["```" + focus[focusNameHash[args[0]]].allProbs + "```"]);
			return;
		}
		else if(focusNameHash[args[0]]){
			
			//If input has known disambiguation to the bot. See "ambiguous" array.
			if(ambiguous[args[1]]){
				sendMessages(channelID, ["Did you mean: " + ambiguous[args[1]]]);
				return;
			}
			
			try{
				sendMessages(channelID, ["```" + getCharProb(args[1], ((args[2] && Number.isInteger(parseInt(args[2])) && parseInt(args[2]) > 1) ? parseInt(args[2]) : 1), focusNameHash[args[0]], focus[focusNameHash[args[0]]]) + "```"]);
			}
			catch(e){
				if(e.name == "CharacterNotFoundException"){
					sendMessages(channelID, ["Character " + args[1] + " not found."]);
				}
				else{
					sendMessages(channelID, ["Wow! What the fuck even went wrong? An uncaught error ocurred. Please notify the author."]);
					console.log(e.stack);
				}
			}
		}
	}
});

function parseToFixedPercent(num, toPoint){
	return parseFloat((num * 100).toFixed(toPoint));
}

function getCharacterInfo(name){
	for(var i = 0; i < 4; i++){
		if(raritiesHash[i][name]){
			return {color: i, character: rarities[i][raritiesHash[i][name]]};
		}
	}
	
	throw{
		name: "CharacterNotFoundException",
		message: "Character not found."
	}
}

function getCharacterFocus(name){
	for(var i = 1; i < raritiesCache.focus.length; i++){
		if(raritiesCache.focus[i].hash[name]){return i;}
	}
	
	return null;
}

bot.on("disconnect", function() {
	console.log("Bot disconnected");
	bot.connect() //Auto reconnect
});

/*Function declaration area*/
function sendMessages(ID, messageArr, interval) {
	var resArr = [], len = messageArr.length;
	var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
	if (typeof(interval) !== 'number') interval = 50;

	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				bot.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(err, res) {
					resArr.push(err || res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendMessages();
			}
		}, interval);
	}
	_sendMessages();
}

function sendFiles(channelID, fileArr, interval) {
	var resArr = [], len = fileArr.length;
	var callback = typeof(arguments[2]) === 'function' ? arguments[2] : arguments[3];
	if (typeof(interval) !== 'number') interval = 50;

	function _sendFiles() {
		setTimeout(function() {
			if (fileArr[0]) {
				bot.uploadFile({
					to: channelID,
					file: fileArr.shift()
				}, function(err, res) {
					resArr.push(err || res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendFiles();
			}
		}, interval);
	}
	_sendFiles();
}

/* From discord.js */
function splitMessage(text, { maxLength = 1950, char = '\n', prepend = '', append = '' } = {}) {
  if (text.length <= maxLength) return [text];
  const splitText = text.split(char);
  if (splitText.length === 1) throw new Error('Message exceeds the max length and contains no split characters.');
  const messages = [''];
  let msg = 0;
  for (let i = 0; i < splitText.length; i++) {
    if (messages[msg].length + splitText[i].length + 1 > maxLength) {
      messages[msg] += append;
      messages.push(prepend);
      msg++;
    }
    messages[msg] += (messages[msg].length > 0 && messages[msg] !== prepend ? char : '') + splitText[i];
  }
  return messages;
}