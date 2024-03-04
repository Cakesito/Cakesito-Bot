const fix = require('./util/fix');

module.exports = async (message, db, data = { prefix }) => {
    message = fix(message);

    await db.set(`g_${message.guildId}.prefix`, data.prefix);
    return message.reply('Mi nuevo prefix en este servidor es: `' + data.prefix + '`');
}