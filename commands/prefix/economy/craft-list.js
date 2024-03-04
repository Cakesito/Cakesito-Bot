const craftList = require('../../../base_commands/craft-list');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');

        craftList(message, db, { client: client });
    }
}
