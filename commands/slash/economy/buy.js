const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const buy = require('../../../base_commands/buy');

let options = new SlashCommandStringOption()
.setName('objeto')
.setDescription('Nombre del objeto')
.setRequired(true);

module.exports = {
    deactivated: true,
    data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra algo en la tienda')
    .addStringOption(options)
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a comprar')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const shop = await db.get(`g_${interaction.guildId}.shop`);
        if (!shop.items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true});
        const items = await db.get(`g_${interaction.guildId}.craft.items`);

        let item = shop.items.find(x => x.name == interaction.options.getString('objeto'));
        if (!item) return interaction.reply({ content: 'No encontré el objeto `' + interaction.options.getString('objeto') + '`.', ephemeral: true });
        let amount = interaction.options.getInteger('cantidad') || 1;

        buy(interaction, db, { item: item, craft: items, amount: amount });

    }
}