
module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let prefix = args[0];
        if (!prefix) return message.reply('¿Cuál es el nuevo prefix?');

        await db.set(`g_${message.guildId}.prefix`, prefix);
        return message.reply('Mi nuevo prefix en este servidor es: `' + prefix + '`');
    }
}