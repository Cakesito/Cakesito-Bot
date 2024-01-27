const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Mira la clasificación del servidor')
    .addStringOption(x => 
        x.setName('categoría')
        .setDescription('Una categoría entre: cash, bank o total (por defecto)')
        .addChoices({
            name: 'cash', value: 'cash',
            name: 'bank', value: 'bank',
            name: 'total', value: 'total'
        })),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        
        let lb = {};
        let num = [];
        let category = interaction.options.getString('categoría') || 'total';

        let pre = await db.all();
        pre = pre.filter(x =>  x.id.startsWith(`e_${interaction.guildId}_`));

        if(category == 'cash') {
            let pre = await db.all();
            pre = pre.filter(x => x.id.startsWith(`e_${interaction.guildId}_`));

            pre.forEach(e => {
                let help = `{ "${e.value.cash}": "${e.id}" }`;
                lb = {...lb, ...JSON.parse(help)};
                num.push(e.value.cash || 0);
            });
        }

        if(category == 'bank') {
            let pre = await db.all();
            pre = pre.filter(x => x.id.startsWith(`e_${interaction.guildId}_`));

            pre.forEach(e => {
                let help = `{ "${e.value.bank}": "${e.id}" }`;
                lb = {...lb, ...JSON.parse(help)};
                num.push(e.value.bank || 0);
            });
        }

        if(category == 'total') {
            let pre = await db.all();
            pre = pre.filter(x => x.id.startsWith(`e_${interaction.guildId}_`));

            pre.forEach(e => {
                let help = `{ "${(e.value.bank || 0) + (e.value.cash || 0)}": "${e.id}" }`;
                lb = {...lb, ...JSON.parse(help)};
                num.push((e.value.bank || 0) + (e.value.cash || 0));
            });
        }

        num = num.sort((a, b) => b - a);

        let rank;
        let desc = num.map((e, i) => {
            var sub = interaction.guild.id.length + 3;
            let name = interaction.guild.members.resolve(lb[e].substring(sub));

            if(name && name.user.id  == interaction.user.id) rank = i + 1;
            return `**${i + 1}.** ${name? name.user.tag : '`unknown`'} **·** <:star:991110840780599336> ${e}`;
        });
        let count = 0;
        let pages = [];
        let txt = [];
        var maxPerPage = 1;

        desc.forEach(item => {
            if(desc.length < maxPerPage && desc.length == count) pages.push(txt);
            
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
        .setAuthor({ name: `${interaction.guild.name} Leaderboard`, iconURL: interaction.guild.iconURL() })
        .setColor(0x0099FF)
        .setDescription(pages[current].join('\n'))
        .setFooter({ text: `Página 1/${pages.length} · Tu posición: ${rank}` });

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
            let filter = (i) => (i.customId == id || i.customId == `n${id}`) && i.user.id == interaction.user.id;
            let collector = interaction.channel.createMessageComponentCollector({ filter, time: 300_000 });
    
            collector.on('collect', async i => {
                i.customId == id ? current-- : current++;

                embed.setFields([]);
                previousBtn.setDisabled(pages[current - 1] ? false : true);
                nextBtn.setDisabled(pages[current + 1] ? false : true);

                embed.setDescription(pages[current].join('\n'));
                embed.setFooter({ text: `Página 1/${pages.length} · Tu posición: ${rank}` })
                
                await i.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

            });

            collector.on('end', () => client.collectors.set('active', id - 1));
        }

        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    } 
}