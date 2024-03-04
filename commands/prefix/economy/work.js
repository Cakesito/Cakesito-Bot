const work = require('../../../base_commands/work');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        work(message, db);
    }
}