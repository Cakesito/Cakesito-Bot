const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { shop } = require('../../economy.json');

let a = {
    'quesoken': 'Quesoken',
    'cash': '<:star:991110840780599336> Quesocoin'
}

module.exports = {
    run: async (client, message) => {

        if(!shop) return message.reply('No hay tienda.');

        let shopText = Object.entries(shop).map(e => {
            let price = e[1]['price-qk'] ? { type: 'quesoken', price: e[1]['price-qk'] } : { type: 'cash', price: e[1]['price-qc'] };
            return { title: e[0], type: price.type, price: price.price, description: e[1].description };
        });

        let count = 0;
        let pages = [];
        let txt = [];
        
        shopText.forEach((e, i, a) => {
            count++
            txt.push(e);

            if(count == 10) {
                pages.push(txt);
                count = 0;
            }

            if(a.length < 10 && a.length == count) pages.push(txt);

        });
        
        let current = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Shop` })
        .setColor(0x0099FF)
        .setFooter({ text: `Página 1/${pages.length}` });

        pages[current].forEach(e => {
            embed.addFields({ name: `**${e.price} ${a[e.type]} - ${e.title}**`, value: e.description });
        });

        let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('sh-p')
            .setLabel('<<')
            .setStyle('Primary')
            .setDisabled(pages[current - 1] ? false : true),

            new ButtonBuilder()
            .setCustomId('sh-n')
            .setLabel('>>')
            .setStyle('Primary')
            .setDisabled(pages[current + 1] ? false : true)
        );

        if(pages.length > 1) {
            let filter = (i) => i.customId.startsWith('sh-') && i.user.id == message.author.id;
            let collector = message.channel.createMessageComponentCollector({ filter, time: 20000 });
    
            collector.on('collect', async i => {
                if(i.user.id == message.author.id) {
                    let isnext = i.customId == 'sh-n' ? true : false;
                    isnext ? current++ : current--;
    
                    pages[current].forEach(e => {
                        embed.addFields({ name: `**${e.price} ${a[e.type]} - ${e.title}**`, value: e.description });
                    });

                    embed.setFooter({ text: `Página ${current + 1}/${pages.length}` });
        
                    await i.update({ embeds: [embed], components: [row] });
                }
            });
        }

        return message.reply({ embeds: [embed], components: [row] })
    }
}
