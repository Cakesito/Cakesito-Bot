const defaultEconomy = require('../default_economy.json');

module.exports = {
    run: async (client, guild) => {
        const db = client.db.get('db');
        await db.set(`g_${guild.id}`, defaultEconomy);
    }
}