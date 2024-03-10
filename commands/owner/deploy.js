const { REST, Routes } = require('discord.js');
const { token, clientId } = require('../../config.json');

module.exports = {
    onlyOwner: true,
    runPrefix: (client, message) => module.exports.run(client, message),

    run: async (client, message) => {
        const rest = new REST().setToken(token);
        let commands = [...client.commands.filter(x => !x.deactivated && !x.onlyOwner), ...client.menu_commands];

        try {
            await rest.put(Routes.applicationCommands(clientId), { body: commands.map(x => x[1].data) });
            message.reply(`${commands.length} commands`);
        } catch (err) {
            console.log(err);
            message.reply('err');
        }

    }
}