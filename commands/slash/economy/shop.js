const { SlashCommandBuilder } = require('discord.js');
const shop = require('../../../base_commands/shop');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Mira la tienda'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        shop(interaction, db);
    }
}
