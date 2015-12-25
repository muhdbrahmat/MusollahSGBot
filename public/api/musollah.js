var geolib = require('geolib');
var util = require('./util');
var nusmusollah = require('../locations/nusMusollah.json');

function musollahAsk(chatId) {
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                ['Nearest Musollah'],
                ['UTown']
            ],
            one_time_keyboard: true
        })
    };
    var greeting = "Good " + util.currentTimeGreeting() + ", where would you like NUS bus timings for?";
    bot.sendMessage(chatId, greeting, opts);
    musollahSessions[chatId] = new musollahSession(chatId);
    musollahSessions[chatId].onGoing = true;
}

function musollahLocatorPrompt(chatId,musollah_name,location){
    var locResponse = "Please send me your location to find the nearest musollah location:\n\n";
    locResponse += "You can do this by selecting the paperclip icon (📎) ";
    locResponse += "followed by attaching your location (📌).";

    if (name === "nearest musollah") {
        return bot.sendMessage(chatId,locResponse, {
            reply_markup:JSON.stringify({
                hide_keyboard: true
            })
        });
    }

    function callback(err, data) {
        if (err) {
            return bot.sendMessage(chatId, err, {
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    hide_keyboard: true
                })
            });
        }
        bot.sendMessage(chatId, callback, {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                hide_keyboard: true
            })
        });
        musollahSessions[chatId] = new musollahSession(chatId);
    }
    musollahLocator(callback, musollah_name, location);
}

function musollahLocator(callback, musollah_name, location) {
    
    var musollah;
    var directions;

    if (location) {
        musollah = nearestMusollah(location);
    } else {
        musollah = musollah_name;
    }
    if (!busstop) {
        return callback("Invalid Musollah Chosen. Send location or choose again", null);
    }

    for (var i = 0; i < nusMusollah.length; i++) {
        if (musollah === nusMusollah[i].name) {
            direction = nusMusollah[i].direction;
        }
    }

    return callback(direction);
}

function nearestMusollah(start) {
    var minDist = Infinity;
    var minMusollah = "UTown ERC";
    for (var i = 0; i < nus.length; i++) {
        var dist = geolib.getDistance(start, nusMusollah[i].coordinates);
        if (dist < minDist) {
            minDist = dist;
            minMusollah = nusMusollah[i].name;
        }
    }
    return minMusollah;
}

function musollahSession(chatId) {
    this.chatId = chatId;
    this.onGoing = false;
    musollahSessions[chatId] = this;
}


module.exports ={
    musollahAsk : musollahAsk,
    musollahLocatorPrompt : musollahLocatorPrompt,
    musollahSession : musollahSession
}

