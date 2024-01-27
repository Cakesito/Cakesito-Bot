const { EmbedBuilder } = require('discord.js');
const { craft } = require('../../../economy.json');

module.exports = {
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let item, amount, current, inv, n;

        if (!args[0]) return message.reply('Indica una cantidad y/o un objeto.');

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply('Vas a crear un... ¿qué?')
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(`Vas a crear ${amount}... ¿qué?`);
        }

        craft.items.forEach(x => {
            if (x.name.startsWith(item)) item = x;
        });
        
        if (!item.description) {
            craft.items.forEach(x => {
                if (x.name.includes(item)) item = x;
            });
        }

        if (!item.description) return message.reply('No encontré el objeto `' + item + '`.');

        inv = await db.get(`e_${message.guild.id}_${message.author.id}.inv`) || {};
        current = {};
        Object.entries(inv).forEach(x => current[x[0]] = x[1]);

        Math.floor(Math.random() * 100) <= item.probability ? n = 'success' : n = 'fail';

        var missing = [];

        // Quick.db doesn't work in forEach
        for (x of Object.keys(item.materials)) {
            if ((item.materials[x] * amount) > current[x]) {
                missing.push(`x${(item.materials[x] * amount) - current[x]} **${x}** (${current[x]}/${item.materials[x] * amount})`);
            }
        }
        
        if(missing.length) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no tienes los __recursos suficientes__.\n\n**Faltante:**\n${missing.join('\n')}`)
            .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        for (x of Object.keys(item.materials)) {
            await db.sub(`e_${message.guild.id}_${message.author.id}.inv.${x}`, item.materials[x] * amount);
        }

        await db.add(`e_${message.guild.id}_${message.author.id}.${item.type}`, amount);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
        .setDescription(craft.txt[n].replace('{item}', item.name))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}