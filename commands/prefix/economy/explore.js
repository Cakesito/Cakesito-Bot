const explore = require('../../../base_commands/explore');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        explore(message, db);
    }
}