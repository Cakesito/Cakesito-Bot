const daily = require('../../../base_commands/daily');

module.exports = {
    daily: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        daily(message, db);
    }
}