module.exports = {
    onlyOwner: true,
    
    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db, { client }),

    run: async (message, comments, db, { client }) => {

        client.cooldowns.each(async (value, key) => {
            await db.set(`temp_${key}`, value);
        });

        return message.reply('saved: ' + client.cooldowns.size);
    }
}