module.exports = {
    ownerOnly: true,
    run: async (client, message) => {
        let time = Date.now();
        const m = await message.reply('...');

        m.edit(`Pong!\nMensajes: ${time - message.createdTimestamp}ms\nIda y vuelta: ${m.createdTimestamp - message.createdTimestamp}ms\nDiscord Gateway: ${Math.round(client.ws.ping)}ms`);
    }
}