const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');
        const craft = await db.get(`g_${message.guildId}.craft`);

        if(!craft.items.length) return message.reply('No hay objetos que crear.');

        let craftText = Object.entries(craft.items).map(x => {
            let materials = Object.entries(x[1].materials).map(x => `x${x[1]} **${x[0]}**`);
            return { title: x[1].name, materials: materials, description: x[1].description ?? '_Este objeto no tiene descripción_' }
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
        .setAuthor({ name: `${message.guild.name} Objetos creables` })
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
            let filter = (i) => (i.customId == `cake-${id}` || i.customId == `cake-n-${id}`) && i.user.id == message.author.id;
            let collector = message.channel.createMessageComponentCollector({ filter, time: 300_000 });
    
            collector.on('collect', async i => {
                i.customId == `cake-${id}` ? current-- : current++;

                embed.setFields([]);
                previousBtn.setDisabled(pages[current - 1] ? false : true);
                nextBtn.setDisabled(pages[current + 1] ? false : true);

                pages[current].forEach(e => {
                    embed.addFields({ name: `**${e.title}**`, value: `${e.description}\n${e.materials.join(', ')}` });
                });

                embed.setFooter({ text: `Página ${current + 1}/${pages.length}` });
                await i.update({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

            });

            collector.on('end', () => client.collectors.set('active', id - 1));
        }

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    }
}
