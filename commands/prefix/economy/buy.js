const { EmbedBuilder } = require('discord.js');
const { shop, convertion } = require('../../../economy.json');

module.exports = {
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let current, item, amount;

        if (!args[0]) return message.reply('Indica una cantidad y/o un objeto.');

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply('Vas a comprar un... ¿qué?')
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(`Vas a comprar ${amount}... ¿qué?`);
        }

        shop.items.forEach(x => {
            if (x.name.startsWith(item)) item = x;
        });
        
        if (!item.description) {
            shop.items.forEach(x => {
                if (x.name.includes(item)) item = x;
            });
        }

        if (!item.description) return message.reply('No encontré el objeto `' + item + '`.');

        item = item[0];

        current = await db.get(`e_${message.guild.id}_${message.author.id}.${item.price.type}`) || 0;
        var hasBought = await db.get(`e_${interaction.guildId}_${interaction.user.id}.alreadyBought`) || [];

        if (item.onlyOnce && hasBought.includes(item.name)) return interaction.reply({ content: 'Ya has comprado este objeto.' });
        if (amount > 1 && item.reward.type == 'role') return message.reply(`Solo puedes comprar uno.`);

        item.reward.amount = item.reward.amount * amount;
        item.price.amount = item.price.amount * amount;
        
        if (current < item.price.amount) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no lo puedes comprar.\nFaltante: x${item.price.amount - current} ${convertion[item.price.type]}`)
            .setTimestamp()
            return message.reply({ embeds: [embed] });
        }

        let text = `x${item.reward.amount || 1} ${convertion[item.reward.type]}`;

        if (item.reward.type == 'role') {
            let role = await message.guild.roles.cache.find(x => x.id == item.reward.id);
            if (!role) return message.reply('Rol no encontrado.');

            message.member.roles.add(role);
            text = `<@&${item.reward.id}>`;

        } else await db.add(`e_${message.guild.id}_${message.author.id}.${item.reward.type}`, item.reward.amount);

        await db.sub(`e_${message.guild.id}_${message.author.id}.${item.price.type}`, item.price.amount);
        if (item.onlyOnce) await db.push(`e_${interaction.guildId}_${interaction.user.id}.alreadyBought`, item.name);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(shop.txt.replace('{reward}', text))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}
