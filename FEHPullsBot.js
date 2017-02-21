var Discord = require('discord.js');
var fs = require("fs");

var bot = new Discord.Client();

// Get auth data for login.
try {
	var auth = require("./auth.json");
} catch (e){
	console.log("No auth.JSON file.\n"+e.stack);
	process.exit();
}

bot.login(auth.token);

// Set up these for later useage.
var green_3 = 0, green_4 = 0, green_5 = 0, green_F = 0,
	red_3 = 0, red_4 = 0, red_5 = 0, red_F = 0,
	blue_3 = 0, blue_4 = 0, blue_5 = 0, blue_F = 0,
	colorless_3 = 0, colorless_4 = 0, colorless_5 = 0, colorless_F = 0,
	total_3, total_4, total_5, total_F,
	P_G, P_B, P_R, P_C,
	EO_R, EO_B, EO_G, EO_C;
	
var P_3 = 0.58, P_4 = 0.36, P_5 = 0.03, P_F = 0.03;

var allProbs = "";

var helpMessage = "Commands:\n"+
					"```\n\t"+
						"~help\n\t\t"+
							"-Displays this message.\n\t"+
						"~all\n\t\t"+
							"-Displays overall probabilities of all colours & rarities.\n\t"+
						"~char <character name> [number]\n\t\t"+
							"-Displays probabilities of the character given the color.\n\t"+
							"-The number argument is optional, but will tell you approx. probability & cost in orbs.\n\t\t"+
								"ex. ~char hector 10."+
					"```\n";
					
//Setup pulling rarities.
try {
	var raritiesCache = require("./rarities.json");
	
	for(var i = 1; i < raritiesCache.rarities.green.length; i++){
		green_3 += raritiesCache.rarities.green[i]._3;
		green_4 += raritiesCache.rarities.green[i]._4;
		green_5 += raritiesCache.rarities.green[i]._5;
		green_F += raritiesCache.rarities.green[i]._F;
	}

	for(var i = 1; i < raritiesCache.rarities.red.length; i++){
		red_3 += raritiesCache.rarities.red[i]._3;
		red_4 += raritiesCache.rarities.red[i]._4;
		red_5 += raritiesCache.rarities.red[i]._5;
		red_F += raritiesCache.rarities.red[i]._F;
	}

	for(var i = 1; i < raritiesCache.rarities.blue.length; i++){
		blue_3 += raritiesCache.rarities.blue[i]._3;
		blue_4 += raritiesCache.rarities.blue[i]._4;
		blue_5 += raritiesCache.rarities.blue[i]._5;
		blue_F += raritiesCache.rarities.blue[i]._F;
	}

	for(var i = 1; i < raritiesCache.rarities.colorless.length; i++){
		colorless_3 += raritiesCache.rarities.colorless[i]._3;
		colorless_4 += raritiesCache.rarities.colorless[i]._4;
		colorless_5 += raritiesCache.rarities.colorless[i]._5;
		colorless_F += raritiesCache.rarities.colorless[i]._F;
	}
	
	total_3 = green_3 + red_3 + blue_3 + colorless_3;
	total_4 = green_4 + red_4 + blue_4 + colorless_4;
	total_5 = green_5 + red_5 + blue_5 + colorless_5;
	total_F = green_F + red_F + blue_F + colorless_F;
	
	//console.log("\nTotal 3: " + total_3 + " | 4: " + total_4 + " | 5: " + total_5 + " | Focus: " + total_F);
	
	P_G = green_3 / total_3 * P_3 + green_4 / total_4 * P_4 + green_5 / total_5 * P_5 + green_F / total_F * P_F;
	P_R = red_3 / total_3 * P_3 + red_4 / total_4 * P_4 + red_5 / total_5 * P_5 + red_F / total_F * P_F;
	P_B = blue_3 / total_3 * P_3 + blue_4 / total_4 * P_4 + blue_5 / total_5 * P_5 + blue_F / total_F * P_F;
	P_C = colorless_3 / total_3 * P_3 + colorless_4 / total_4 * P_4 + colorless_5 / total_5 * P_5 + colorless_F / total_F * P_F;
	
	EO_R = (5 * Math.pow(1 - P_R, 5) + 5 * 5 * Math.pow(P_R, 1) * Math.pow(1 - P_R, 4) + 9 * 10 * Math.pow(P_R, 2) * Math.pow(1 - P_R, 3) + 13 * 10 * Math.pow(P_R, 3) * Math.pow(1 - P_R, 2) + 17 * 5 * Math.pow(P_R, 4) * Math.pow(1 - P_R, 1) + 20 * Math.pow(P_R, 5)) /
				(5 * Math.pow(P_R, 1) * Math.pow(1 - P_R, 4) + 2 * 10 * Math.pow(P_R, 2) * Math.pow(1 - P_R, 3) + 3 * 10 * Math.pow(P_R, 3) * Math.pow(1 - P_R, 2) + 4 * 5 * Math.pow(P_R, 4) * Math.pow(1 - P_R, 1) + 5 * Math.pow(P_R, 5));
	EO_B = (5 * Math.pow(1 - P_B, 5) + 5 * 5 * Math.pow(P_B, 1) * Math.pow(1 - P_B, 4) + 9 * 10 * Math.pow(P_B, 2) * Math.pow(1 - P_B, 3) + 13 * 10 * Math.pow(P_B, 3) * Math.pow(1 - P_B, 2) + 17 * 5 * Math.pow(P_B, 4) * Math.pow(1 - P_B, 1) + 20 * Math.pow(P_B, 5)) /
				(5 * Math.pow(P_B, 1) * Math.pow(1 - P_B, 4) + 2 * 10 * Math.pow(P_B, 2) * Math.pow(1 - P_B, 3) + 3 * 10 * Math.pow(P_B, 3) * Math.pow(1 - P_B, 2) + 4 * 5 * Math.pow(P_B, 4) * Math.pow(1 - P_B, 1) + 5 * Math.pow(P_B, 5));
	EO_G = (5 * Math.pow(1 - P_G, 5) + 5 * 5 * Math.pow(P_G, 1) * Math.pow(1 - P_G, 4) + 9 * 10 * Math.pow(P_G, 2) * Math.pow(1 - P_G, 3) + 13 * 10 * Math.pow(P_G, 3) * Math.pow(1 - P_G, 2) + 17 * 5 * Math.pow(P_G, 4) * Math.pow(1 - P_G, 1) + 20 * Math.pow(P_G, 5)) /
				(5 * Math.pow(P_G, 1) * Math.pow(1 - P_G, 4) + 2 * 10 * Math.pow(P_G, 2) * Math.pow(1 - P_G, 3) + 3 * 10 * Math.pow(P_G, 3) * Math.pow(1 - P_G, 2) + 4 * 5 * Math.pow(P_G, 4) * Math.pow(1 - P_G, 1) + 5 * Math.pow(P_G, 5));
	EO_C = (5 * Math.pow(1 - P_C, 5) + 5 * 5 * Math.pow(P_C, 1) * Math.pow(1 - P_C, 4) + 9 * 10 * Math.pow(P_C, 2) * Math.pow(1 - P_C, 3) + 13 * 10 * Math.pow(P_C, 3) * Math.pow(1 - P_C, 2) + 17 * 5 * Math.pow(P_C, 4) * Math.pow(1 - P_C, 1) + 20 * Math.pow(P_C, 5)) /
				(5 * Math.pow(P_C, 1) * Math.pow(1 - P_C, 4) + 2 * 10 * Math.pow(P_C, 2) * Math.pow(1 - P_C, 3) + 3 * 10 * Math.pow(P_C, 3) * Math.pow(1 - P_C, 2) + 4 * 5 * Math.pow(P_C, 4) * Math.pow(1 - P_C, 1) + 5 * Math.pow(P_C, 5));
	
	try{
		allProbs = getProbs("red") + getProbs("blue") + getProbs("green") + getProbs("colorless");
		console.log("");
	}
	catch(e){
		console.log(e.stack);
	}
} catch (e){
	console.log("No rarities.JSON file.\n"+e.stack);
	process.exit();
}

var ambiguous = {
	"tiki": "TikiY or TikiA",
	"corrin": "CorrinM or CorrinF",
	"robin": "RobinM"
}

bot.on("ready", function(event) {
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.user.username + " - (" + bot.user.id + ")");
});

bot.on("message", function(msg) {
	var userID = msg.author.id;
	var user = msg.author.name;
	var channel = msg.channel;
	var channelID = msg.channel.id;
	var message = msg.content;

	if(userID == bot.user.id){return;}
	
	console.log("\n==== New Message ====")
	
	console.log(user + " - " + userID);
	console.log("in " + channelID);
	console.log(message);
	console.log("----------");
	
	if(message.startsWith("~")) {
		var args = message.toLowerCase().split("~")[1].split(" ");
		
		if(args[0] == "help"){
			msg.author.sendMessage(helpMessage);
		}
		else if(args[0] == "all"){
			channel.sendMessage("```" + allProbs + "```");
			return;
		}
		else if(args[0] == "char"){
			//If input has known disambiguation to the bot. See "ambiguous" array.
			if(ambiguous[args[1]]){
				channel.sendMessage("Did you mean: " + ambiguous[args[1]]);
				return;
			}
			
			try{
				channel.sendMessage("```" + getCharProb(args[1], ((args[2] && Number.isInteger(parseInt(args[2])) && parseInt(args[2]) > 1) ? parseInt(args[2]) : 1)) + "```");
			}
			catch(e){
				if(e.name == "CharacterNotFoundException"){
					channel.sendMessage("Character " + args[1] + " not found.");
				}
				else{
					channel.sendMessage("Wow! What the fuck even went wrong? An uncaught error ocurred. Please notify the author.");
					console.log(e.stack);
				}
			}
		}
	}
});

function getCharProb(name, num){
	try{
		var charInfo = getCharacterInfo(name);
	}catch(e){ throw e; }
	
	var _P, _EO;
	
	if(charInfo.color == "red"){
		_P = P_R;
		_EO = EO_R;
	}
	else if(charInfo.color == "blue"){
		_P = P_B;
		_EO = EO_B;
	}
	else if(charInfo.color == "green"){
		_P = P_G;
		_EO = EO_G;
	}
	else if(charInfo.color == "colorless"){
		_P = P_C;
		_EO = EO_C;
	}
	
	console.log(charInfo.character);
	
	return "\n" + charInfo.character.name + " has probability of being pulled from " + charInfo.color + " orbs with:" +
						"\n\t\t" +		parseFloat(((	
														(charInfo.character._3 ? P_3 / total_3 : 0) + 
														(charInfo.character._4 ? P_4 / total_4 : 0) + 
														(charInfo.character._5 ? P_5 / total_5 : 0) + 
														(charInfo.character._F ? P_F / total_F : 0)
													) / _P * 100).toFixed(5)) + "% chance to be pulled at any rarity." +
						(charInfo.character._3 ? "\n\t\t" + parseFloat(((P_3 / total_3) / _P * 100).toFixed(5)) + "% chance at 3 stars." : "") +
						(charInfo.character._4 ? "\n\t\t" + parseFloat(((P_4 / total_4) / _P * 100).toFixed(5)) + "% chance at 4 stars." : "") +
						(charInfo.character._5 || charInfo.character._F ? "\n\t\t" + parseFloat((((charInfo.character._5 ? P_5 / total_5 : 0) + (charInfo.character._F ? P_F / total_F : 0)) / _P * 100).toFixed(5)) + "% chance at 5 stars." : "") +
				(num > 1 ? 
					"\n\tand from " + num + " " + charInfo.color + " orbs: " +
					"\n\t\t" +		parseFloat(((1 - (Math.pow (1 - ((
															(charInfo.character._3 ? P_3 / total_3 : 0) + 
															(charInfo.character._4 ? P_4 / total_4 : 0) + 
															(charInfo.character._5 ? P_5 / total_5 : 0) + 
															(charInfo.character._F ? P_F / total_F : 0)) / _P)
													, num))) * 100).toFixed(5)) + "% chance to be pulled at any rarity." +
						(charInfo.character._3 ? "\n\t\t" + parseFloat(((1 - Math.pow(1 - ((P_3 / total_3) / _P), num)) * 100).toFixed(5)) + "% chance at 3 stars." : "") +
						(charInfo.character._4 ? "\n\t\t" + parseFloat(((1 - Math.pow(1 - ((P_4 / total_4) / _P), num)) * 100).toFixed(5)) + "% chance at 4 stars." : "") +
						(charInfo.character._5 || charInfo.character._F ? "\n\t\t" + parseFloat(((1 - Math.pow(1 - (((charInfo.character._5 ? P_5 / total_5 : 0) + (charInfo.character._F ? P_F / total_F : 0)) / _P), num)) * 100).toFixed(5)) + "% chance at 5 stars." : "") +
					"\n\tWith expectation of " + Math.ceil(num * _EO) + " orbs spent to do so."
				: "");
}

function getCharacterInfo(name){
	if(raritiesCache.hash.green[name]){
		return {color: "green", character: raritiesCache.rarities.green[raritiesCache.hash.green[name]]};
	}
	else if(raritiesCache.hash.red[name]){
		return {color: "red", character: raritiesCache.rarities.red[raritiesCache.hash.red[name]]};
	}
	else if(raritiesCache.hash.blue[name]){
		return {color: "blue", character: raritiesCache.rarities.blue[raritiesCache.hash.blue[name]]};
	}
	else if(raritiesCache.hash.colorless[name]){
		return {color: "colorless", character: raritiesCache.rarities.colorless[raritiesCache.hash.colorless[name]]};
	}
	else{
		throw{
			name: "CharacterNotFoundException",
			message: "Character not found."
		}
	}
}

function getProbs(color){
	var _3 = 0, _4 = 0, _5 = 0, _F = 0, _P = 0;
	
	if(color == "red"){
		_3 = red_3;
		_4 = red_4;
		_5 = red_5;
		_F = red_F;
		_P = P_R;
	}
	else if(color == "blue"){
		_3 = blue_3;
		_4 = blue_4;
		_5 = blue_5;
		_F = blue_F;
		_P = P_B;
	}
	else if(color == "green"){
		_3 = green_3;
		_4 = green_4;
		_5 = green_5;
		_F = green_F;
		_P = P_G;
	}
	else if(color == "colorless"){
		_3 = colorless_3;
		_4 = colorless_4;
		_5 = colorless_5;
		_F = colorless_F;
		_P = P_C;
	}
	else{
		throw{
			name: "InvalidColorError",
			message: "Color not found."
		}
	}
	
	//console.log(color + " has 3: " + _3 + " | 4: " + _4 + " | 5: " + _5 + " | Focus: " + _F + " " + _P);
	return "\n" + color + " has: " +
				"\n\t3 stars           : " + parseFloat((_3 / total_3 * P_3 / _P * 100).toFixed(5)) + "% chance " +
				"\n\t4 stars           : " + parseFloat((_4 / total_4 * P_4 / _P * 100).toFixed(5)) + "% chance " +
				"\n\t5 stars(Non-Focus): " + parseFloat((_5 / total_5 * P_5 / _P * 100).toFixed(5)) + "% chance " +
				"\n\t5 stars(Focus)    : " + parseFloat((_F / total_F * P_F / _P * 100).toFixed(5)) + "% chance " +
				"\n\t5 stars(All)      : " + parseFloat((_F / total_F * P_F / _P * 100 + _5 / total_5 * P_5 / _P * 100).toFixed(5)) + "% chance ";
}

bot.on("disconnect", function() {
	console.log("Bot disconnected");
	console.log("Trying to relogin...");
	bot.login(auth.token);
});