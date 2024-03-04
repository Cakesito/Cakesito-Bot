const { SlashCommandBuilder } = require('discord.js');
const explore = require('../../../base_commands/explore');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explora la zona'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        explore(interaction, db);
    }
}