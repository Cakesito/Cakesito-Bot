const { SlashCommandBuilder } = require('discord.js');
const claim = require('../../../base_commands/claim');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Reclama una recompensa'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        claim(interaction, db);
    }
}
