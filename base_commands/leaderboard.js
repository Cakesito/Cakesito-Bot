const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { mode, client }) => {
    message = fix(message);

    const convertion = await db.get(`g_${message.guildId}.convertion`);
    const all = await db.startsWith(`e_${message.guildId}_`);

    let lb = [];
    switch (data.mode) {
        case 'cash':
            all.forEach(x => lb.push({ username: x.id.split('_')[2], value: x.value.cash || 0}));
            break;

        case 'bank':
            all.forEach(x => lb.push({ username: x.id.split('_')[2], value: x.value.bank || 0 }));
            break;

        case 'total':
            all.forEach(x => lb.push({ username: x.id.split('_')[2], value: (x.value.cash || 0) + (x.value.bank || 0) }));
            break;

        default: 
            all.forEach(x => lb.push({ username: x.id.split('_')[2], value: (x.value.cash || 0) + (x.value.bank || 0) }));
            break;;
    }

    lb.sort((a, b) => b.value - a.value);
    
    var userRank = 0;
    var currentPage = 0;
    var maxPerPage = 10;                                // idk how it works but you need to add 1 if its odd
    var maxPages = Math.floor(lb.length / maxPerPage) + (maxPerPage % 2 === 1 ? 1 : 0); 

    const cache = message.guild.members.cache.map(x => {
        return { id: x.id, member: x };
    });

    for (user of lb) {
        var member = cache.find(x => x.id == user.username)?.member;
        if (!member) member = await message.guild.members.fetch(user.username);
        if (member.user?.id === message.user.id) userRank = lb.indexOf(user) + 1;

        lb[lb.indexOf(user)] = { username: member.displayName || member.user.username, value: user.value };
    }

    if (maxPerPage >= lb.length) maxPerPage = lb.length + 1;
    
    let embed = new EmbedBuilder()
    .setAuthor({ name: `${message.guild.name} Leaderboard`, iconURL: message.guild.iconURL() })
    .setColor(0x0099FF)
    .setDescription(lb
            .slice(0, maxPerPage)
            .map((x, i) => `${i + 1}. ${x.username} · ${convertion.emoji} ${x.value} ${convertion.name}`)
            .join('\n'))
    .setFooter({ text: `Página 1/${maxPages} · Tu posición: ${userRank}` });

    var id = data.client.collectors.get('active') || 0;
    data.client.collectors.set('active', id + 1);

    let previousBtn = new ButtonBuilder()
    .setCustomId(`cake-${id}`)
    .setLabel('<<')
    .setStyle('Primary')
    .setDisabled(true);
    
    let nextBtn = new ButtonBuilder()
    .setCustomId(`cake-n-${id}`)
    .setLabel('>>')
    .setStyle('Primary')
    .setDisabled(currentPage + 1 >= maxPages ? true : false);

    if (lb.length > maxPerPage) {
        const filter = (i) => (i.customId == `cake-${id}` || i.customId == `cake-n-${id}`) && i.user.id == message.userId;
        let collector = message.channel.createMessageComponentCollector({ filter, time: 300_000 });

        collector.on('collect', async i => {
            i.customId == `cake-${id}` ? currentPage-- : currentPage++;

            previousBtn.setDisabled(currentPage === 0 ? true : false);
            nextBtn.setDisabled(currentPage + 1 >= maxPages ? true : false);

            embed.setDescription(lb
                .slice(currentPage * maxPerPage, (currentPage * maxPerPage) + maxPerPage)
                .map((x, i) => `${i + 1}. ${x.username} · ${convertion.emoji} ${x.value} ${convertion.name}`)
                .join('\n'));

            embed.setFooter({ text: `Página ${currentPage + 1}/${maxPages} · Tu posición: ${userRank}` })
            
            await i.update({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });

        });

        collector.on('end', () => data.client.collectors.set('active', id - 1));
    }

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
}