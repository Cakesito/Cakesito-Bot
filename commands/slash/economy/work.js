const { SlashCommandBuilder } = require('discord.js');
const work = require('../../../base_commands/work');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja y gana dinero'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        work(interaction, db);
    }
}