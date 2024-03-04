const setPrefix = require('../../../base_commands/set-prefix');

module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let prefix = args[0];
        if (!prefix) return message.reply('¿Cuál es el nuevo prefix?');
        setPrefix(message, db, { prefix: prefix });
    }
}