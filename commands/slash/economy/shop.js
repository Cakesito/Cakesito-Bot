const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { shop, convertion } = require('../../../economy.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Mira la tienda'),

    run: async (client, interaction) => {

        if(!shop) return interaction.reply({ content: 'No hay tienda.', ephemeral: true });

        let shopText = Object.entries(shop.items).map(x => {
            return { title: x[1].name, type: convertion[x[1].price.type], price: x[1].price.amount, description: x[1].description }
        });

        let count = 0;
        let pages = [];
        let txt = [];
        var maxPerPage = 1;
        
        shopText.forEach(item => {

            if(shopText.length < maxPerPage && shopText.length == count) pages.push(txt);
            
            count++
            txt.push(item);

            if (count == maxPerPage) {
                pages.push(txt);
                txt = [];
                count = 0;
            }

        });
        
        let current = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} Shop` })
        .setColor(0x0099FF)
        .setFooter({ text: `Página 1/${pages.length}` });

        pages[current].forEach(e => {
            embed.addFields({ name: `**${e.price} ${e.type} - ${e.title}**`, value: e.description });
        });

        var id = client.collectors.get('active') || 0;
        client.collectors.set('active', n + 1);

        let previousBtn = new ButtonBuilder()
        .setCustomId(id)
        .setLabel('<<')
        .setStyle('Primary')
        .setDisabled(pages[current - 1] ? false : true);
        
        let nextBtn = new ButtonBuilder()
        .setCustomId('n' + id)
        .setLabel('>>')
        .setStyle('Primary')
        .setDisabled(pages[current + 1] ? false : true);
        
        if(pages.length > 1) {
            let filter = (i) => (i.customId == n || i.customId == `n${id}`) && i.user.id == interaction.user.id;
            let collector = interaction.channel.createMessageComponentCollector({ filter, time: 300_000 });
    
            collector.on('collect', async i => {
                i.customId == id ? current-- : current++;

                embed.setFields([]);
                previousBtn.setDisabled(pages[current - 1] ? false : true);
                nextBtn.setDisabled(pages[current + 1] ? false : true);

                pages[current].forEach(e => {
                    embed.addFields({ name: `**${e.price} ${e.type} - ${e.title}**`, value: e.description });
                });

                embed.setFooter({ text: `Página ${current + 1}/${pages.length}` });
                await i.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

            });

            collector.on('end', () => client.collectors.set('active', id - 1));
        }

        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    }
}
