const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,

    runPrefix: async (client, comments, message, args) => { 
        const db = client.db;
        const craft = await db.get(`g_${message.guildId}.craft`);
        if (!craft.items.length) return message.reply(comments.commandNotAvailable);

        let item, amount;

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
        item = craft.items.find(x => x.name === temp);
        if (!item) item = craft.items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = craft.items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply(comments.objectNotFound.replace('{obj}', temp));

        module.exports.run(message, comments, db, { amount, item });

    },
    
    runSlash: async (client, comments, interaction) => { 
        const db = client.db;
        const craft = await db.get(`g_${interaction.guildId}.craft`);
        if (!craft.items.length) return interaction.reply({ content: comments.commandNotAvailable, ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = craft.items.find(x => x.id == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (!item) return interaction.reply({ content: comments.objectNotFound.replace('{obj}', selected), ephemeral: true });

        module.exports.run(interaction, comments, db, { amount, item });
    },

    run: async (message, comments, db, { amount, item }) => {
        message = fix(message);
        if (amount == 0) return message.reply({ content: comments.zeroAmount, ephemeral: true });
        
        comments = comments.economy.use;

        if (!item.use?.type) return message.reply({ content: comments.cantUseObject, ephemeral: true });

        var path = 'cash';
        let rewardText;
        const current = await db.get(`e_${message.guildId}_${message.user.id}.inv.objects._${item.id}`) || 0;
        if (current <= 0) return message.reply({ content: comments.noObjects.replace('{obj}', item.name), ephemeral: true });
        if (current < amount) return message.reply({ content: comments.notEnoughObjects
            .replace('{amount}', amount - current)
            .replace('{obj}', item.name), ephemeral: true }
        );

        const convertion = await db.get(`g_${message.guildId}.convertion`);

        // add more
        switch (item.use.type) {
            case 'cash': 
                rewardText = `${convertion.emoji} ${amount * item.use.amount} ${convertion.name}`;
                break;

            default: return;
        }

        await db.sub(`e_${message.guildId}_${message.user.id}.inv.objects._${item.id}`, amount);
        await db.add(`e_${message.guildId}_${message.user.id}.${path}`, amount * item.use.amount);

        var embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0x0099FF)
            .setDescription(comments.mainResponse.replace('{reward}', rewardText))
            .setTimestamp();

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}