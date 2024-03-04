const { SlashCommandBuilder } = require('discord.js');
const daily = require('../../../base_commands/daily');

module.exports = {
    daily: true,
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama una recompensa diaria'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        daily(interaction, db);        
    }
}