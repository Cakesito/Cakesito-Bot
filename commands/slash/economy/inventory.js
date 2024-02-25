const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Mira tu inventario o el de un usuario')
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el inventario de un usuario')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const materials = await db.get(`g_${interaction.guildId}.materials`);
        const craft = await db.get(`g_${interaction.guildId}.craft`);

        let member = interaction.options.getMember('usuario') || interaction.member;

        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        let inv = await db.get(`e_${interaction.guildId}_${member.user.id}.inv`);

        let invEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTimestamp();

        if(inv) {
            Object.entries(inv).forEach(e => {
                let desc = materials.find(x => x.name === e[0]) || craft.items.find(x => x.name === e[0]);
                if (!desc) return;
                
                if(e[1] != 0) invEmbed.addFields({ name: `${e[0]} x${e[1]}`, value: desc.description == "" ? '_Este objeto no tiene descripción_' : desc.description  });
            });
        
        } else invEmbed.setDescription('Parece que no hay nada...');

        return interaction.reply({ embeds: [invEmbed] });
        
    }
}

function mayus (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}