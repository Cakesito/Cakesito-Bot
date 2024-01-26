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
                pre = pre.filter(x => x.id.startsWith(`e_${member.guild.id}_`));

                pre.forEach(e => {
                    let help = `{ "${e.value.cash}": "${e.id}" }`;
                    lb = {...lb, ...JSON.parse(help)};
                    num.push(e.value.cash || 0);
                });
            }

            if(args[0] == 'bank') {
                let pre = await db.all();
                pre = pre.filter(x => x.id.startsWith(`e_${member.guild.id}_`));

                pre.forEach(e => {
                    let help = `{ "${e.value.bank}": "${e.id}" }`;
                    lb = {...lb, ...JSON.parse(help)};
                    num.push(e.value.bank || 0);
                });
            }
        }

        if(!args[0] || args[0] == 'total') {
            let pre = await db.all();
            pre = pre.filter(x => x.id.startsWith(`e_${member.guild.id}_`));

            pre.forEach(e => {
                let help = `{ "${(e.value.bank || 0) + (e.value.cash || 0)}": "${e.id}" }`;
                lb = {...lb, ...JSON.parse(help)};
                num.push((e.value.bank || 0) + (e.value.cash || 0));
            });
        }

        num = num.sort((a, b) => b - a);

        let rank;
        let desc = num.map((e, i) => {
            let name = message.guild.members.resolve(lb[e].substring(2));
            if(name && name.user.tag  == message.author.tag) rank = i + 1;
            return `**${i + 1}.** ${name? name.user.tag : '`unknown`'} **·** <:star:991110840780599336> ${e}`;
        });

        let count = 0;
        let pages = [];
        let txt = [];
        desc.forEach((e, i, a) => {
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
        .setAuthor({ name: `${message.guild.name} Leaderboard`, iconURL: message.guild.iconURL() })
        .setColor(0x0099FF)
        .setDescription(pages[current].join('\n'))
        .setFooter({ text: `Página 1/${pages.length} · Tu posición: ${rank}` });

        let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('lb-p')
            .setLabel('<<')
            .setStyle('Primary')
            .setDisabled(pages[current - 1] ? false : true),

            new ButtonBuilder()
            .setCustomId('lb-n')
            .setLabel('>>')
            .setStyle('Primary')
            .setDisabled(pages[current + 1] ? false : true)
        );

        if(pages.length > 1) {
            let filter = (i) => i.customId.startsWith('lb-') && i.user.id == message.author.id;
            let collector = message.channel.createMessageComponentCollector({ filter, time: 20000 });
    
            collector.on('collect', async i => {
                if(i.user.id == message.author.id) {
                    let isnext = i.customId == 'lb-n' ? true : false;
                    isnext ? current++ : current--;
    
                    embed.setDescription(pages[current].join('\n'));
                    embed.setFooter({ text: `Página ${current + 1}/${pages.length} · Tu posición: ${rank}` });
        
                    await i.update({ embeds: [embed], components: [row] });
                }
            });
        }   

        // let inf = {
        //     current: 0,
        //     total: pages.length,
        //     pages: pages
        // }

        // client.lb.set('pages', inf);
        
        return message.reply({ embeds: [embed], components: [row] });

    } 
}