const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { descriptions } = require('../../../economy.json');

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

        let inv = await db.get(`e_${interaction.guildId}_${member.user.id}.inv`);

        let invEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTimestamp();

        if(inv) {
            Object.entries(inv).forEach(e => {
                if(e[0] != '-') invEmbed.addFields({ name: `${mayus(e[0])} x${e[1]}`, value: mayus(descriptions[e[0]]) });
            });
        } else invEmbed.setDescription('Parece que no hay nada...');

        return interaction.reply({ embeds: [invEmbed] });
        
    }
}

function mayus (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}