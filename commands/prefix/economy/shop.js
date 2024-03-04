const shop = require('../../../base_commands/shop');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');
        shop(message, db);
    }
}