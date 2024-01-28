const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { craft } = require('../../../economy.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('craft-list')
    .setDescription('Mira la lista de objetos creables'),

    run: async (client, interaction) => {

        if(!craft) return interaction.reply('No hay objetos que crear.');

        let craftText = Object.entries(craft.items).map(x => {
            let materials = Object.entries(x[1].materials).map(x => `x${x[1]} **${x[0]}**`);
            return { title: x[1].name, materials: materials, description: x[1].description }
        });

        let count = 0;
        let pages = [];
        let txt = [];
        var maxPerPage = 10;
        
        craftText.forEach(item => {
            count++
            if(craftText.length < maxPerPage && craftText.length == count) pages.push(txt);
            
            txt.push(item);

            if (count == maxPerPage) {
                pages.push(txt);
                txt = [];
                count = 0;
            }

        });
        
        let current = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} Objetos creables` })
        .setColor(0x0099FF)
        .setFooter({ text: `Página 1/${pages.length}` });

        pages[current].forEach(e => {
            embed.addFields({ name: `**${e.title}**`, value: `${e.description}\n${e.materials.join(', ')}` });
        });

        var id = client.collectors.get('active') || 0;
        client.collectors.set('active', id + 1);

        let previousBtn = new ButtonBuilder()
        .setCustomId(`cake-${id}`)
        .setLabel('<<')
        .setStyle('Primary')
        .setDisabled(pages[current - 1] ? false : true);
        
        let nextBtn = new ButtonBuilder()
        .setCustomId(`cake-n-${id}`)
        .setLabel('>>')
        .setStyle('Primary')
        .setDisabled(pages[current + 1] ? false : true);
        
        if(pages.length > 1) {
            let filter = (i) => (i.customId == `cake${id}` || i.customId == `cake-n-${id}`) && i.user.id == interaction.user.id;
            let collector = interaction.channel.createMessageComponentCollector({ filter, time: 300_000 });
    
            collector.on('collect', async i => {
                i.customId == `cake-${id}` ? current-- : current++;

                embed.setFields([]);
                previousBtn.setDisabled(pages[current - 1] ? false : true);
                nextBtn.setDisabled(pages[current + 1] ? false : true);

                pages[current].forEach(e => {
                    embed.addFields({ name: `**${e.title}**`, value: `${e.description}\n${e.materials.join(', ')}` });
                });

                embed.setFooter({ text: `Página ${current + 1}/${pages.length}` });
                await i.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

            });

            collector.on('end', () => client.collectors.set('active', id - 1));
        }

        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    }
}
