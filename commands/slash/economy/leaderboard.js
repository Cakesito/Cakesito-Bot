const { SlashCommandBuilder } = require('discord.js');
const leaderboard = require('../../../base_commands/leaderboard');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Mira la clasificación del servidor')
    .addStringOption(x => 
        x.setName('categoría')
        .setDescription('Una categoría entre: cash, bank o total (por defecto)')
        .addChoices(
            { name: 'total', value: 'total'},
            { name: 'bank', value: 'bank'},
            { name: 'cash', value: 'cash' }
        )),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        let category = interaction.options.getString('categoría') || 'total';

        leaderboard(interaction, db, { mode: category, client: client });
    } 
}