const { SlashCommandBuilder } = require("discord.js");
const balance = require('../../../base_commands/balance');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mira tu dinero o el de un usuario')
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el dinero de un usuario')),

    run: async (client, interaction) => {

        const db = client.db.get('db');
        let member = interaction.options.getMember('usuario') || interaction.member;
        
        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });
        
        balance(interaction, db, { member: member })

    }
}