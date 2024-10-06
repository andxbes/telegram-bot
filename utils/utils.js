const md5 = require('js-md5');

function debounce(fn, waitTime) {
    let cache = new Map();

    return async function (...args) {
        const key = md5(args);
        const now = Date.now();

        if (cache.has(key) && (now - cache.get(key).time) < waitTime) {
            return cache.get(key).result;
        }

        const result = await fn(...args);
        cache.set(key, { result, time: now });

        return result;
    };
}

function getformatDateTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому добавляем 1
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getformatTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}`;
}


function filter_messages(messages) {
    const true_key_words = [
        '🥒', '🍆', '🥦', '✅', '🟢', '⛔️', '☀️', '😡', '🌼', '🫒', '🟥', '🚨', '🛑', '☀️',
        '🌞', '👌', '❌', '🪀', '🌳', '👹', '💚', '🤬', '🧶', '🌵', '🚓', '🚧', '🐸', '👮‍♂'
    ];

    const true_words = [
        'грязно', 'грязь', 'крепят', 'Ямы', 'Тучи',
        'чисто', 'чистота', 'чист', 'чистый',
        'чизт', 'тихо', 'норм', 'в норме', 'ок', 'ok',
        'оливок', 'оливки', 'оливками',
        'зеленых', 'зелень', 'зелени', 'синие', 'синих', 'ухилянт', 'пикселя', 'черные',
        'проверяют', 'упаковали', 'пресуют', 'пресують',
        'проверка', 'пешие',
        'внимание', 'патруль', 'патрулька', 'тцк', 'копы',
        'черти', 'гнили', 'гниль',
        'волга', 'нива', 'бус', 'девятка', 'волга', 'амулет',
        'на[\\s]+военных[\\s]+номерах',
        'воины[\\s]+добра'
    ];

    // Проверка на положительные слова
    const true_regex = new RegExp(`(^|[\\s])(${true_words.join('|')})([\\s\\!\\.\\,]+|$)`, 'i');

    // Негативные слова
    const false_key_words = ['?'];
    const false_words = [
        'бля', 'желательно', 'а какой', 'в ахуе', 'пох',
        'если', 'чево', 'чего', 'шотак', 'нахуй', 'блэт',
        'вайб', 'почему', 'долбоеб', 'далбаеб', 'хуй', 'пидар',
        'вобщем', 'мне', 'заебал', 'развлекайся', 'перерва', 'пиво', 'водка', 'водки'
    ];
    const false_regex = new RegExp(`(^|[\\s])(${false_words.join('|')})([\\s\\?\\.\\,\\!]|$)`, 'i');

    messages = messages.filter((message) => {
        const msg = message?.message;

        // Проверяем на наличие нежелательного знака "?"
        const hasFalseKeyWord = false_key_words.some(word => msg.includes(word));

        // Проверка наличия положительных слов
        const passesTrueCheck = (true_key_words.some(word => msg.includes(word)) || true_regex.test(msg));
        // Проверка на наличие нежелательных слов
        const passesFalseCheck = hasFalseKeyWord || false_regex.test(msg);

        // Если нет положительных слов и не присутствуют нежелательные слова, отклоняем сообщение
        const isValidMessage = msg?.length < 120 && (passesTrueCheck && !passesFalseCheck);

        // Отладочная информация
        // console.log(`Message: "${msg}"`);
        // console.log(`Passes True Check: ${ passesTrueCheck } `);
        // console.log(`Passes False Check: ${ passesFalseCheck } `);
        // console.log(`Is Valid Message: ${ isValidMessage } `);

        return isValidMessage;
    });

    return messages;
}


module.exports = { getformatDateTime, getformatTime, filter_messages, debounce };