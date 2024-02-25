const { default_prefix } = require('../../../config.json');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');
        let prefix = await db.get(`g_${message.guildId}.prefix`) || default_prefix;

        return message.reply('Mi prefix en este servidor es: `' + prefix + '`');
    }
}