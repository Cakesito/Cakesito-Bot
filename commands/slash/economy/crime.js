const { SlashCommandBuilder } = require('discord.js');
const crime = require('../../../base_commands/crime');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Comete un crimen'),

    run: async (client, interaction) => {
        const db = client.db.get('db');

        crime(interaction, db);
    }
}