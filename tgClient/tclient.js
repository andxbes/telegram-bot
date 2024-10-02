const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
const dotenv = require("dotenv");
const dotenvConf = dotenv.config();
if (dotenvConf.error) {
    throw dotenvConf.error;
}

const stringSession = new StringSession(process.env.API_T_SESSION); // fill this later with the value from session.save()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


const client = new TelegramClient(stringSession,
    parseInt(process.env.API_T_ID),
    process.env.API_T_HASH, {
    connectionRetries: 5,
});
client.start({
    phoneNumber: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your number: ", resolve)
        ),
    password: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your password: ", resolve)
        ),
    phoneCode: async () =>
        new Promise((resolve) =>
            rl.question("Please enter the code you received: ", resolve)
        ),
    onError: (err) => console.log(err),
}).then(() => {
    console.log("You should now be connected.");
    //console.log(client.session.save()); // Save this string to avoid logging in again to API_T_SESSION
});

// await client.sendMessage("me", { message: "Hello!" });




async function getAvailableChanel() {
    await client.connect();

    const dialogs = await client.getDialogs();

    // Фильтрация только каналов
    const channels = dialogs.filter((dialog) => dialog.isChannel);
    // console.log('chanel', channels); // prints the result
    console.log('Channels:');
    channels.forEach((channel) => {
        console.log(`Name: ${channel.title}, ID: ${channel.id}`);
    });
    return result;
}


const chatId = -1001746152256;


let cache = [];
function removeOldMessages() {
    if (cache.length > 0) {
        const old_length = cache.length;
        const yesterday = parseInt((Date.now() / 1000) - (24 * 60 * 60));
        cache = cache.filter(message => {
            return message.date >= yesterday;
        });
        console.log('Updated cache , removed :', old_length - cache.length);
    }
}
setInterval(removeOldMessages, 60 * 60 * 1000);


async function getMessagesForPeriod(fromTime) {
    await client.connect();
    const limit = 50;
    const chat = await client.getEntity(chatId);


    let offsetId = 0;

    let buffer = [];

    generalLoop: while (true) {
        let messages = await client.getMessages(chat, {
            limit: limit,
            offsetId: offsetId,
        });

        if (messages.length === 0) break;
        if (cache.length == 0) {
            buffer.push(...messages);
        } else {
            for (const message of messages) {

                if (message.id !== cache[cache.length - 1].id) {
                    buffer.push(message);
                } else {
                    break generalLoop;
                }
            }
        }
        offsetId = messages[messages.length - 1].id;
    }

    cache.push(...(buffer.reverse()));
    return cache.filter((message) => message.date >= fromTime);
}

module.exports = { client, getAvailableChanel, getMessagesForPeriod };