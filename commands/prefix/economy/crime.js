const crime = require('../../../base_commands/crime');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');

        crime(message, db);
    }
}