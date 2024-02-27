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
        const items = await db.get(`g_${interaction.guildId}.craft.items`);

        let member = interaction.options.getMember('usuario') || interaction.member;

        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        var id = client.collectors.get('active') || 0;
        client.collectors.set('active', id + 1);

        const materialsOption = new StringSelectMenuOptionBuilder()
            .setLabel('Materiales')
            .setValue('materials')
            .setDefault(true)
        
        const objectOption = new StringSelectMenuOptionBuilder()
            .setLabel('Objetos')
            .setValue('objects')

        const select = new StringSelectMenuBuilder()
            .setPlaceholder('Selecciona')
            .setCustomId(`cake-i-${id}`)
            .addOptions(materialsOption, objectOption);

        let inv = await db.get(`e_${member.guild.id}_${member.user.id}.inv`);

        let invEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTimestamp();

        let invMaterialsText = [];
        let invObjectsText = [];

        if(inv) {
            Object.entries(inv).forEach(e => {
                if (e[1] === 0) return;

                let material = materials.find(x => x.name === e[0]) || items.find(x => x.name === e[0]);
                if (!material) return;
                var field = { name: `x${e[1]} **${e[0]}**`, value: material?.description == "" ? '_Este objeto no tiene descripción_' : material?.description };

                if (material) {
                    invMaterialsText.push(field);
                } else invObjectsText.push(field);

            });

            invEmbed.setFields(invMaterialsText);

        } else invEmbed.setDescription('Parece que no hay nada...');

        const filter = (i) => i.customId === `cake-i-${id}` && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300_000 });

        collector.on('collect', async i => {
            if (i.values[0] === 'objects') {
                materialsOption.setDefault(false);
                objectOption.setDefault(true);

                if (invObjectsText.length) {
                    invEmbed.setFields(invObjectsText);
                    invEmbed.setDescription(null);
                } else {
                    invEmbed.setDescription('Parece que no hay nada...');
                    invEmbed.setFields([]);
                }
                
            } else {
                materialsOption.setDefault(true);
                objectOption.setDefault(false);
                
                if (invMaterialsText.length) {
                    invEmbed.setDescription(null);
                    invEmbed.setFields(invMaterialsText);
                } else {
                    invEmbed.setDescription('Parece que no hay nada...');
                    invEmbed.setFields([]);
                }
            }

            await i.update({ embeds: [invEmbed], components: [new ActionRowBuilder().addComponents(select)] })
        });

        collector.on('end', () => client.collectors.set('active', id - 1));

        return interaction.reply({ embeds: [invEmbed], components: [new ActionRowBuilder().addComponents(select)] });
    }
}
