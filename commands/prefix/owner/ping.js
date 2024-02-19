
module.exports = {
    ownerOnly: true,
    run: async (client, message) => {
        const m = await message.reply('Ping?');
        m.edit(`Pong!\nLatencia: ${m.createdTimestamp - message.createdTimestamp}ms.\nAPI: ${Math.round(client.ws.ping)}ms`);
    }
}