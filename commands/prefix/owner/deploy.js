const { REST, Routes } = require('discord.js');
const { token, clientId } = require('../../../config.json');

module.exports = {
    ownerOnly: true,
    run: async (client, message) => {
        const rest = new REST().setToken(token);
        let commands = [...client.slash_commands.filter(x => !x.deactivated), ...client.menu_commands];
        
        await rest.put(Routes.applicationCommands(clientId), { body: commands.map(x => x[1].data) });

        return message.reply('.');
    }
}