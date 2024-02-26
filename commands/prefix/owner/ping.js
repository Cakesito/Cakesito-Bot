module.exports = {
    ownerOnly: true,
    run: async (client, message) => {
        const m = await message.reply('...');
        m.edit(`Pong!\nMensajes: ${Date.now() - message.createdTimestamp} \nLatencia: ${m.createdTimestamp - message.createdTimestamp}ms\nAPI: ${Math.round(client.ws.ping)}ms`);
    }
}