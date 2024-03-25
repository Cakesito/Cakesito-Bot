const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,
    
    runPrefix: async (client, comments, message, args) => {
        const db = client.db;
        const items = await db.get(`g_${message.guildId}.craft.items`) || [];
        if (!items.length) return message.reply(comments.commandNotAvailable);

        let item, amount;

        if (!args[0]) return message.reply(comments.noAmountAndObject);

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply(comments.noObject);
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(comments.invalidObject.replace('{amount}', amount));
        }

        var temp = item.toLowerCase();
        item = items.find(x => x.name === temp);
        if (!item) item = items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply(comments.objectNotFound.replace('{obj}', temp));
        
        module.exports.run(message, comments, db, { item, amount });
    },

    runSlash: async (client, comments, interaction) => {
        const db = client.db;
        const items = await db.get(`g_${interaction.guildId}.craft.items`);
        if (!items.length) return interaction.reply({ content: comments.commandNotAvailable, ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = items.find(x => x.id == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (!item) return interaction.reply({ content: comments.objectNotFound.replace('{obj}', selected), ephemeral: true });

        module.exports.run(interaction, comments, db, { item: item, amount: amount });
    },

    run: async (message, comments, db, { item, amount }) => {
        message = fix(message);
        if (amount == 0) return message.reply({ content: comments.zeroAmount, ephemeral: true });

        comments = comments.economy.craft;

        if (!item.materials.length) return message.reply({ content: comments.craftUnavailable, ephemeral: true });
        const materials = await db.get(`g_${message.guildId}.materials`);
    
        const n = Math.floor(Math.random() * 100) <= item.probability ? 'success' : 'fail';
    
        const inv = await db.get(`e_${message.guildId}_${message.user.id}.inv.materials`) || {};
        var missing = [];
    
        for (let material of item.materials) {
            var mat = materials.find(x => x.id === material.ref_id);
            var crrMat = inv[`_${material.ref_id}`] || 0;

            if (!mat) return message.reply({ content: comments.materialNotFound, ephemeral: true });

            if (!crrMat || (material.amount * amount) > crrMat) {
                missing.push(`x${(material.amount * amount) - crrMat} **${mat.name}** (${crrMat}/${material.amount * amount})`);
            }
        }
        
        if(missing.length) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(comments.missingMaterials.replace('{missing}', missing.join('\n')))
            .setTimestamp();
    
            return message.reply({ embeds: [embed], ephemeral: true });
        }
    
        for (var material of item.materials) {
            await db.sub(`e_${message.guildId}_${message.userId}.inv.materials._${material.ref_id}`, material.amount * amount)
        }
    
        await db.add(`e_${message.guild.id}_${message.userId}.inv.objects._${item.id}`, amount);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.user.displayAvatarURL() })
        .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
        .setDescription(comments.mainResponse[n].replace('{reward}', `x${amount} **${item.name}**`))
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}