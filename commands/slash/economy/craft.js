const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const craft = require('../../../base_commands/craft');

let options = new SlashCommandStringOption()
.setName('objeto')
.setDescription('Nombre del objeto a crear')
.setRequired(true);

module.exports = {
    deactivated: true,
    data: new SlashCommandBuilder()
    .setName('craft')
    .setDescription('Crea algo')
    .addStringOption(options)
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a crear')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const items = await db.get(`g_${interaction.guildId}.craft.items`);
        if (!items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = items.find(x => x.name == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (!item) return interaction.reply({ content: 'No encontré el objeto `' + selected + '`.', ephemeral: true });

        craft(interaction, db, { item: item, amount: amount });
    }
}

