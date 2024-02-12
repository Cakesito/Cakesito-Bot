const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    aliases: ['lb', 'top'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        
        let lb = {};
        let num = [];

        if(args[0]) {
            if(args[0] == 'cash') {
                let pre = await db.all();
                pre = pre.filter(x => x.id.startsWith(`e_${message.guild.id}_`));

                pre.forEach(e => {
                    let help = `{ "${e.value.cash}": "${e.id}" }`;
                    lb = {...lb, ...JSON.parse(help)};
                    num.push(e.value.cash || 0);
                });
            }

            if(args[0] == 'bank') {
                let pre = await db.all();
                pre = pre.filter(x => x.id.startsWith(`e_${message.guild.id}_`));

                pre.forEach(e => {
                    let help = `{ "${e.value.bank}": "${e.id}" }`;
                    lb = {...lb, ...JSON.parse(help)};
                    num.push(e.value.bank || 0);
                });
            }
        }

        if(!args[0] || args[0] == 'total') {
            let pre = await db.all();
            pre = pre.filter(x => x.id.startsWith(`e_${message.guild.id}_`));

            pre.forEach(e => {
                let help = `{ "${(e.value.bank || 0) + (e.value.cash || 0)}": "${e.id}" }`;
                lb = {...lb, ...JSON.parse(help)};
                num.push((e.value.bank || 0) + (e.value.cash || 0));
            });
        }

        num = num.sort((a, b) => b - a);

        let rank;
        let desc = await Promise.all(num.map(async (e, i) => {
            var sub = message.guild.id.length + 3;
            let name = message.guild.members.cache.get(lb[e].substring(sub));
            if (!name) { 
                await message.guild.members.fetch(lb[e].substring(sub));
                name = message.guild.members.cache.get(lb[e].substring(sub));
            }

            if(name && name.user.tag == message.author.tag) rank = i + 1;
            return `**${i + 1}.** ${name ? name.user.tag : '`unknown`'} **·** <:star:991110840780599336> ${e}`;
        }));

        let count = 0;
        let pages = [];
        let txt = [];
        var maxPerPage = 10;

        desc.forEach((item, i) => {
            count++
            if(desc.length < maxPerPage && desc.length == count) pages.push(txt);
            
            txt.push(item);

            if (count == maxPerPage) {
                pages.push(txt);
                txt = [];
                count = 0;
            }

        });

        let current = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Leaderboard`, iconURL: message.guild.iconURL() })
        .setColor(0x0099FF)
        .setDescription(pages[current].join('\n'))
        .setFooter({ text: `Página 1/${pages.length} · Tu posición: ${rank}` });

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

                embed.setDescription(pages[current].join('\n'));
                embed.setFooter({ text: `Página 1/${pages.length} · Tu posición: ${rank}` })
                
                await i.update({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

            });

            collector.on('end', () => client.collectors.set('active', id - 1));
        }

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    } 
}