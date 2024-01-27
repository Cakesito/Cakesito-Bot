const { REST, Routes } = require('discord.js');
const { token, clientId } = require('../../../config.json');

module.exports = {
    ownerOnly: true,
    run: async (client, message) => {
        const rest = new REST().setToken(token);

        await rest.put(Routes.applicationCommands(clientId), { body: [...client.slash_commands].map(x => x[1].data) });

        return message.reply('.');
    }
}