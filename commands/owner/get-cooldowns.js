module.exports = {
    onlyOwner: true,
    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db, { client }),

    run: async (message, comments, db, { client }) => {
        let all = await db.startsWith(`temp_c`);

        await all.forEach(async (value) => {
            client.cooldowns.set(value.id.replace('temp_', ''), value.value);
            await db.delete(value.id);
        });

        return message.reply('restored: ' + all.length);
    }
}