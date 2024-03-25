const { SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Obtén ayuda: comandos y dashboard')
        .setDescriptionLocalizations({
            "en-GB": "Get help: command list and dashboard",
            "en-US": "Get help: command list and dashboard"
        }),

    runPrefix: (client, comments, message) => module.exports.run(message, comments),
    
    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments),

    run: (message, comments) => {
        message = fix(message);

        return message.reply({ content: comments.other.help.mainResponse, allowedMentions: { repliedUser: false }, ephemeral: true });
    }
}