const { SlashCommandBuilder } = require("discord.js");
const inventory = require('../../../base_commands/inventory');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Mira tu inventario o el de un usuario')
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el inventario de un usuario')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        let member = interaction.options.getMember('usuario') || interaction.member;

        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        inventory(interaction, db, { member: member, client: client });
    }
}