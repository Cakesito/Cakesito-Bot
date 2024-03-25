const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,

    runPrefix: async (client, comments, message, args) => {
        const db = client.db;
        const shop = await db.get(`g_${message.guildId}.shop`);
        if (!shop.items.length) return message.reply(comments.commandNotAvailable);
        const items = await db.get(`g_${message.guildId}.craft.items`);

        let item, amount

        if (!args[0]) return message.reply(comments.noAmountAndObject);

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply(comments.noObject)
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(comments.invalidObject.replace('{amount}', amount));
        }

        var temp = item.toLowerCase();
        item = shop.items.find(x => x.name === temp);
        if (!item) item = shop.items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = shop.items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply(comments.objectNotFound.replace('{obj}', temp));

        module.exports.run(message, comments, db, { item: item, craft: items, amount: amount });
    },

    runSlash: async (client, comments, interaction) => {
        const db = client.db;
        const shop = await db.get(`g_${interaction.guildId}.shop`);
        if (!shop.items.length) return interaction.reply({ content: comments.commandNotAvailable, ephemeral: true});
        const items = await db.get(`g_${interaction.guildId}.craft.items`);

        let item = shop.items.find(x => x.name == interaction.options.getString('objeto'));
        if (!item) return interaction.reply({ content: comments.objectNotFound.replace('{obj}', interaction.options.getString('objeto')), ephemeral: true });
        let amount = interaction.options.getInteger('cantidad') || 1;

        module.exports.run(interaction, comments, db, { item: item, craft: items, amount: amount });
    },

    run: async (message, comments, db, { item, craft, amount }) => {
        message = fix(message);
        if (amount == 0) return message.reply({ content: comments.zeroAmount, ephemeral: true });

        comments = comments.economy.buy;

        const convertion = await db.get(`g_${message.guildId}.convertion`);
    
        let pricePath = 'cash';
        let rewardPath = 'cash';

        if (item.price.type === 'inv.') {
            var obj = craft.find(x => x.id === item.price.ref_id);
            if (!obj) return message.reply({ content: comments.objectNotFound, ephemeral: true });
            pricePath = 'inv.objects._' + obj.id;
        }

        if (item.reward.type === 'inv.') {
            var obj = craft.find(x => x.id === item.reward.ref_id);
            if (!obj) return message.reply({ content: comments.objectNotFound, ephemeral: true });
            rewardPath = 'inv.objects._' + obj.id;
        }
        
        const current = await db.get(`e_${message.guildId}_${message.userId}.${pricePath}`) || 0;
        const hasBought = await db.get(`e_${message.guildId}_${message.userId}.alreadyBought`) || [];
    
        if (item.onlyOnce && hasBought.includes(item.name)) return message.reply({ content: comments.alreadyBought, ephemeral: true });
        if (amount > 1 && item.reward.type == 'role') return message.reply({ content: comments.onlyOnce, ephemeral: true });
    
        item.reward.amount = item.reward.amount * amount;
        item.price.amount = item.price.amount * amount;
        
        if (current < item.price.amount) {
            var missing = `${item.price.type === 'cash' ? convertion.emoji : '' } x${item.price.amount - current} ${item.price.type === 'cash' ? convertion.name : '**' + craft.find(x => x.id === item.price.ref_id)?.name + '**'}`;

            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(comments.cantBuy.replace('{missing}', missing))
            .setTimestamp()
            return message.reply({ embeds: [embed], ephemeral: true });
        }
    
        var text = '';
        if (item.reward.type === 'cash') text = `${convertion.emoji} ${item.reward.amount} ${convertion.name}`;
        if (item.reward.type === 'inv.') text = `x${item.reward.amount} **${craft.find(x => x.id === item.reward.ref_id)?.name}**`
    
        if (item.reward.type == 'role') {
            let role = await message.guild.roles.cache.find(x => x.id == item.reward.id);
            if (!role) return message.reply({ content: comments.roleNotFound.replace('{id}', item.reward.id) });
    
            try { 
                await message.member.roles.add(role);
                
            } catch (err) {
                let embed = new EmbedBuilder()
                    .setColor(0xec5454)
                    .setDescription(comments.notEnoughPermissions.replace('{id}', item.reward.id))
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }
    
            text = `<@&${item.reward.id}>`;
    
        } else { 
            await db.add(`e_${message.guildId}_${message.userId}.${rewardPath}`, item.reward.amount);
        }
    
        await db.sub(`e_${message.guildId}_${message.userId}.${pricePath}`, item.price.amount);
        if (item.onlyOnce) await db.push(`e_${message.guildId}_${message.userId}.alreadyBought`, item.name);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(comments.mainResponse.replace('{reward}', text))
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}