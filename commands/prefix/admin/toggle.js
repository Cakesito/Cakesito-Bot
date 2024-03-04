const toggle = require('../../../base_commands/toggle');

module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        if (!args[0]) return message.reply('¿Qué comando?');
        toggle(message, db, { command: args[0] });
    }
}
