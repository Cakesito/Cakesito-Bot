const { SlashCommandBuilder } = require('discord.js');
const craftList = require('../../../base_commands/craft-list');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('craft-list')
    .setDescription('Mira la lista de objetos creables'),

    run: async (client, interaction) => {
        const db = client.db.get('db');

        craftList(interaction, db, { client: client });
    }
}
