const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['lb', 'top'],
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Mira la clasificación del servidor')
    .setDescriptionLocalizations({
        "en-GB": "View the server's leaderboard",
        "en-US": "View the server's leaderboard"
    })
    .addStringOption(x => 
        x.setName('categoría')
        .setDescription('Una categoría entre: cash, bank o total (por defecto)')
        .setDescriptionLocalizations({
            "en-GB": "A category: cash, bank or all (by default)",
            "en-US": "A category: cash, bank or all (by default)"
        })
        .addChoices(
            { name: 'total', value: 'total',
                name_localizations: { 
                "en-GB": "all", 
                "en-US": "all" 
            }},
            
            { name: 'bank', value: 'bank'},
            { name: 'cash', value: 'cash' }
        )
    ),

    runPrefix: (client, comments, message, args) => module.exports.run(message, comments, client.db, { mode: args[0], client: client }),

    runSlash: (client, comments, interaction) => {        
        var category = interaction.options.getString('categoría') || 'total';
        module.exports.run(interaction, comments, client.db, { mode: category, client: client });
    },

    run: async (message, comments, db, { mode, client }) => {
        message = fix(message);
    
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        const all = await db.startsWith(`e_${message.guildId}_`);
    
        let lb = [];
        switch (mode) {
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
                break;
        }

        if (!lb.length) return message.reply({ content: comments.economy.leaderboard.noLb, ephemeral: true });
    
        lb.sort((a, b) => b.value - a.value);
        lb = lb.slice(0, 50);

        if (lb.length > 10) {
            if (message.options) await message.deferReply();
        }
        
        var userRank = 0;    
        const cache = message.guild.members.cache.map(x => {
            return { id: x.id, member: x };
        });

        for (var i = 0; i < lb.length; i++) {
            var user = lb[i];
            var member = cache.find(x => x.id == user.username)?.member;

            if (!member) member = await message.guild.members.fetch({ user: user.username, cache: true }).catch(() => {});
            if (!member) {
                lb.splice(lb.indexOf(user), 1);
                i--;
                continue;
            }
            
            if (member.user?.id === message.user.id) userRank = lb.indexOf(user) + 1;
            lb[lb.indexOf(user)] = { username: member.displayName || member.user.username, value: user.value, position: i + 1 };
        }

        var maxPerPage = 10;
        var pages = [];
        var temp = [];
        var count = 0;

        lb.forEach((item, i) => {
            count++;
            if (temp.length < maxPerPage && !lb[i + 1]) pages.push(temp);
            temp.push(item);

            if (count === maxPerPage) {
                pages.push(temp);
                temp = [];
                count = 0;
            }
        });
        
        var currentPage = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Leaderboard`, iconURL: message.guild.iconURL() })
        .setColor(0x0099FF)
        .setDescription(pages[currentPage]
                .map(x => `${x.position}. ${x.username} · ${convertion.emoji} ${x.value} ${convertion.name}`)
                .join('\n'))
        .setFooter({ text: comments.economy.leaderboard.embedFooter
            .replace('{currentPage}', '1')
            .replace('{maxPages}', `${pages.length}`)
            .replace('{rank}', `${userRank}`)
        });
    
        var id = client.collectors.get('active') || 0;
        client.collectors.set('active', id + 1);
    
        let previousBtn = new ButtonBuilder()
        .setCustomId(`cake-${id}`)
        .setLabel('<<')
        .setStyle('Primary')
        .setDisabled(true);
        
        let nextBtn = new ButtonBuilder()
        .setCustomId(`cake-n-${id}`)
        .setLabel('>>')
        .setStyle('Primary')
        .setDisabled(pages.length > (currentPage + 1) ? false : true);
    
        if (lb.length > maxPerPage) {
            const filter = (i) => (i.customId == `cake-${id}` || i.customId == `cake-n-${id}`) && i.user.id == message.userId;
            let collector = message.channel.createMessageComponentCollector({ filter, time: 1_800_000 });
    
            collector.on('collect', async i => {
                i.customId == `cake-${id}` ? currentPage-- : currentPage++;
    
                previousBtn.setDisabled(currentPage === 0 ? true : false);
                nextBtn.setDisabled(pages.length > (currentPage + 1) ? false : true);
    
                embed.setDescription(pages[currentPage]
                    .map(x => `${x.position}. ${x.username} · ${convertion.emoji} ${x.value} ${convertion.name}`)
                    .join('\n'));
    
                embed.setFooter({ text: comments.economy.leaderboard.embedFooter
                    .replace('{currentPage}', `${currentPage + 1}`)
                    .replace('{maxPages}', `${pages.length}`)
                    .replace('{rank}', `${userRank}`) 
                })
                
                await i.update({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
    
            });
    
            collector.on('end', () => client.collectors.set('active', id - 1));
        }
    
        if (message.deferred) {
            await message.followUp({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
        } else {
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(previousBtn, nextBtn)] });
        }

    }
}