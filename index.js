const TelegramBot = require('node-telegram-bot-api');
const dotenv = require("dotenv");
const { getMessagesForPeriod } = require('./tclient');
const { getformatTime, filter_messages } = require('./utils/utils');

const result = dotenv.config();
if (result.error) {
    throw result.error;
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

/*
filter_chat_one_hour - Отфильтровать сообщения за последний  час 
filter_chat_three_hours - Отфильтровать сообщения за последниx 3 часa
filter_chat_six_hours - Отфильтровать сообщения за последниx 6 часов
filter_chat_12_hours - Отфильтровать сообщения за последниx 12 часов
filter_chat_24_hours - Отфильтровать сообщения за последниx 24 часa
get_random_joke - Получить случайный анекдот 
*/


bot.onText(/\/get_random_joke/, (msg) => {
    const start = new Date().getTime();

    const chatId = msg.chat.id;
    fetch('https://geek-jokes.sameerkumar.website/api?format=json').then((data) => {
        return data.json();
    }).then((data) => {
        bot.sendMessage(chatId, data?.joke);

        const end = new Date().getTime();
        console.log(`get_random_joke : ${end - start}ms`);
    });
});


bot.onText(/\/filter_chat_one_hour/, async (msg) => {
    const start = new Date().getTime();
    const chatId = msg.chat.id;

    const currentTime = Math.floor(Date.now() / 1000);
    const fromTime = currentTime - 3600;

    getMessagesForPeriod(-1001746152256, fromTime).then((allMessages) => {
        const filteredMessages = filter_messages(allMessages);
        sendAnswer(chatId, filteredMessages, allMessages, start);
    });
});


bot.onText(/\/filter_chat_three_hours/, async (msg) => {
    const start = new Date().getTime();
    const chatId = msg.chat.id;

    const currentTime = Math.floor(Date.now() / 1000);
    const fromTime = currentTime - 3 * 3600;

    getMessagesForPeriod(-1001746152256, fromTime).then((allMessages) => {
        const filteredMessages = filter_messages(allMessages);
        sendAnswer(chatId, filteredMessages, allMessages, start);
    });
});


bot.onText(/\/filter_chat_six_hours/, async (msg) => {
    const start = new Date().getTime();
    const chatId = msg.chat.id;

    const currentTime = Math.floor(Date.now() / 1000);
    const fromTime = currentTime - 6 * 3600;

    getMessagesForPeriod(-1001746152256, fromTime).then((allMessages) => {
        const filteredMessages = filter_messages(allMessages);
        sendAnswer(chatId, filteredMessages, allMessages, start);
    });
});

bot.onText(/\/filter_chat_12_hours/, async (msg) => {
    const start = new Date().getTime();
    const chatId = msg.chat.id;

    const currentTime = Math.floor(Date.now() / 1000);
    const fromTime = currentTime - 12 * 3600;

    getMessagesForPeriod(-1001746152256, fromTime).then((allMessages) => {
        const filteredMessages = filter_messages(allMessages);
        sendAnswer(chatId, filteredMessages, allMessages, start);
    });
});

bot.onText(/\/filter_chat_24_hours/, async (msg) => {
    const start = new Date().getTime();
    const chatId = msg.chat.id;

    const currentTime = Math.floor(Date.now() / 1000);
    const fromTime = currentTime - 24 * 3600;

    getMessagesForPeriod(-1001746152256, fromTime).then((allMessages) => {
        const filteredMessages = filter_messages(allMessages);
        sendAnswer(chatId, filteredMessages, allMessages, start);
    });
});




// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.info(msg.from.id, msg.from.first_name, msg.from.last_name);
});


async function sendAnswer(chatId, filteredMessages, allMessages, start_time) {

    let parts = [[]];
    let part = 0;
    let current_part_length = 0;

    filteredMessages.forEach(msg => {
        // console.log(msg.message, getformatTime(msg.date));
        let text = '';
        const replyMsgId = msg.replyTo?.replyToMsgId;
        if (replyMsgId) {
            const replyMsg = allMessages.find(obj => obj.id === replyMsgId);
            if (replyMsg) {
                parts[part].push(`"${replyMsg.message}"`);
                current_part_length += replyMsg.message.length;
            }
        }
        parts[part].push(`${msg.message} - ${getformatTime(msg.date)}\r\n`);
        current_part_length += msg.message.length;

        if (current_part_length > 3000) {//max 4096 
            part++;
            parts[part] = [];
            current_part_length = 0;
        }
    });
    if (start_time) {
        const end = new Date().getTime();
        parts[part].push(`\r\nFound ${allMessages.length} messages , clear ${filteredMessages.length} messages ,  it took  ${end - start_time}ms`);
    }

    for (const text of parts) {
        await bot.sendMessage(chatId, text.join('\r\n'));
    }
}