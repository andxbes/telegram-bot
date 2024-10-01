const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
const dotenv = require("dotenv");
const result = dotenv.config();
if (result.error) {
    throw result.error;
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
    //console.log(client.session.save()); // Save this string to avoid logging in again
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


async function getMessagesForPeriod(chatId, fromTime) {
    await client.connect();
    const limit = 100;
    const chat = await client.getEntity(chatId);

    let allMessages = [];
    let offsetId = 0;

    while (true) {
        let messages = await client.getMessages(chat, {
            limit: limit,
            offsetId: offsetId,
        });

        if (messages.length === 0) break;

        messages = messages.filter((message) => message.date >= fromTime);
        allMessages = allMessages.concat(messages);

        if (messages.length < limit) {
            break;
        }

        // Обновляем offsetId для следующей выборки
        offsetId = messages[messages.length - 1].id;
    }
    return allMessages.reverse();
}

module.exports = { client, getAvailableChanel, getMessagesForPeriod };