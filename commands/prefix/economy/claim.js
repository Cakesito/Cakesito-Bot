const claim = require('../../../base_commands/claim');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        
        claim(message, db);
    }
}