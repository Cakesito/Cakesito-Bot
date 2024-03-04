const leaderboard = require('../../../base_commands/leaderboard');

module.exports = {
    aliases: ['lb', 'top'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        leaderboard(message, db, { mode: args[0], client: client });
    } 
}