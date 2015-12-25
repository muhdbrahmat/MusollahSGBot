var TelegramBot = require('node-telegram-bot-api');
var CREDENTIALS = require('./private/telegram_credentials.json');
var chalk = require('chalk');

var musollah = require('./public/api/musollah');

var bot = new TelegramBot(CREDENTIALS.token, {
    polling: true
});

console.log(chalk.blue("============================"));
console.log(chalk.blue("                            "));
console.log(chalk.blue("     MusollahBot Started    "));
console.log(chalk.blue("                            "));
console.log(chalk.blue("============================"));
console.log(chalk.blue("                            "));

bot.on('message', function(msg) {
    try {
        console.log(msg);
        if (!msg.hasOwnProperty('text') && !msg.hasOwnProperty('location')) {
            return false;
        }
        if (msg.hasOwnProperty('location')) {
            return processLocation(msg);
        }
        var chatId = msg.chat.id;
        var body = msg.text;
        var command = body;
        var args = body;
        if (body.charAt(0) === '/') {
            command = body.split(' ')[0].substr(1);
            args = body.split(' ')[1];
        }

        switch (command.toLowerCase()) {
            case "start":
                return help(chatId);
            case "musollah":
                return musollah.musollahAsk(chatId);
        }
        switch (body.toLowerCase()) {
            default: var musollahSession = musollah.musollahSessions[chatId] || new musollah.musollahSession(chatId);
            if (musollah.musollahSession.onGoing) {
                return musollah.MusollahLocatorPrompt(chatId, body.toLowerCase(), msg.location);
            }
        }
        return default_msg(chatId);
    } catch (e) {
        bot.sendMessage(msg.chat.id, "MusollahBot has encountered an Error, please try again later");
        bot.sendMessage('49892469', e.toString());
    }
});

function help(chatId) {
    var helpMessage =
        "Here's what you can ask Cinnabot!\n\n" +
        "/bus                      - check bus timings for UTown and Dover road\n" +
        "/bus <busstop>   - check bus timings for <busstop>\n" +
        "/dining                  - tell us how the food was\n" +
        "/events                 - view upcoming USP events\n" +
        "/fault                     - report building faults in Cinnamon\n" +
        "/feedback             - send suggestions and complaints\n" +
        "/links                     - view useful links\n" +
        "/nusbus                - check bus timings for NUS buses\n" +
        "/psi                       - get the psi and weather conditions\n" +
        "/register               - register your NUS account!\n" +
        "/spaces                - view upcoming activities in USP spaces\n" +
        "/stats                    - view key statistics";
    bot.sendMessage(chatId, helpMessage);
}

function default_msg(chatId) {
    bot.sendMessage(chatId, "Sorry, I don't understand you! Try another command instead", {
        reply_markup: JSON.stringify({
            hide_keyboard: true
        })
    });
}

function processLocation(msg) {
    var chatId = msg.chat.id;
    var musollahSession = musollah.musollahSessions[chatId] || new musollahSession(chatId);
    if (musollah.musollahSession.onGoing) {
        return musollah.musollahLocatorPrompt(chatId, msg.text, msg.location);
    }
    return default_msg(chatId);
}
