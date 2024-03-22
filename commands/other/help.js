const { SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Obtén ayuda: comandos y dashboard'),

    runPrefix: (client, message) => module.exports.run(message),
    
    runSlash: (client, interaction) => module.exports.run(interaction),

    run: (message) => {
        message = fix(message);
        const msg = `**Lista de comandos:**\nhttps://cakesito.xyz/commands\n\n**Empieza a personalizar desde la dashboard:**\nhttps://cakesito.xyz`;

        return message.reply({ content: msg, allowedMentions: { repliedUser: false }, ephemeral: true });
    }
}