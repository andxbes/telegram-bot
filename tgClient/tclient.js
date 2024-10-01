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


let cache = new Map([]);

const chatId = -1001746152256;

async function getMessagesForPeriod(fromTime) {
    await client.connect();
    const limit = 50;
    const chat = await client.getEntity(chatId);

    // let filteredMessages = [];
    let offsetId = 0;

    generalLoop: while (true) {
        let messages = await client.getMessages(chat, {
            limit: limit,
            offsetId: offsetId,
        });

        if (messages.length === 0) break;

        for (const message of messages) {
            if (!cache.has(message.id)) {
                cache.set(message.id, message);
            } else {
                break generalLoop;
            }
        }
        // Обновляем offsetId для следующей выборки
        offsetId = messages[messages.length - 1].id;
    }

    const result = Array.from(cache.values());

    return result.reverse().filter((message) => message.date >= fromTime);
}

module.exports = { client, getAvailableChanel, getMessagesForPeriod };