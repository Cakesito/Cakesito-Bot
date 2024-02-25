const { EmbedBuilder } = require('discord.js');

module.exports = {
    run: async (client, message, args) => {
        const db = client.db.get('db');
        const craft = await db.get(`g_${message.guildId}.craft`);
        if (!craft.items.length) return message.reply('Este comando no está disponible en este servidor.');

        let item, amount, inv, n;

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

        var temp = item.toLowerCase();
        item = craft.items.find(x => x.name === temp);
        if (!item) item = craft.items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = craft.items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply('No encontré el objeto `' + temp + '`.');
        Math.floor(Math.random() * 100) <= item.probability ? n = 'success' : n = 'fail';

        inv = await db.get(`e_${message.guildId}_${message.author.id}.inv`);
        var missing = [];

        // Quick.db doesn't work in forEach
        for (x of Object.keys(item.materials)) {
            if (!inv[x] || (item.materials[x] * amount) > inv[x]) {
                missing.push(`x${(item.materials[x] * amount) - (inv[x] || 0)} **${x}** (${inv[x] || 0}/${item.materials[x] * amount})`);
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

        await db.add(`e_${message.guild.id}_${message.author.id}.inv.${item.name}`, amount);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
        .setDescription(craft.txt[n].replace('{item}', item.name))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}