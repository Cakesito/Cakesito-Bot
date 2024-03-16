const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,
    
    runPrefix: async (client, message, args) => {
        const db = client.db;
        const items = await db.get(`g_${message.guildId}.craft.items`);
        if (!items.length) return message.reply('Este comando no está disponible en este servidor.');

        let item, amount;

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
        item = items.find(x => x.name === temp);
        if (!item) item = items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply('No encontré el objeto `' + temp + '`.');
        
        module.exports.run(message, db, { item: item, amount: amount });
    },

    runSlash: async (client, interaction) => {
        const db = client.db;
        const items = await db.get(`g_${interaction.guildId}.craft.items`);
        if (!items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = items.find(x => x.id == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (!item) return interaction.reply({ content: 'No encontré el objeto `' + selected + '`.', ephemeral: true });

        module.exports.run(interaction, db, { item: item, amount: amount });
    },

    run: async (message, db, data = { item, amount }) => {
        message = fix(message);
        
        const craft = await db.get(`g_${message.guildId}.craft`);
        const materials = await db.get(`g_${message.guildId}.materials`);
    
        const n = Math.floor(Math.random() * 100) <= data.item.probability ? 'success' : 'fail';
    
        const inv = await db.get(`e_${message.guildId}_${message.user.id}.inv.materials`) || {};
        var missing = [];
    
        // Quick.db doesn't work in forEach
        for (var material of data.item.materials) {
            var mat = materials.find(x => x.id === material.ref_id);
            var crrMat = inv[`_${material.ref_id}`] || 0;

            if (!mat) return message.reply({ content: 'No pude encontrar el material.', ephemeral: true });

            if (!crrMat || (material.amount * data.amount) > crrMat) {
                missing.push(`x${(material.amount * data.amount) - crrMat} **${mat.name}** (${crrMat}/${material.amount * data.amount})`);
            }
        }
        
        if(missing.length) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no tienes los __materiales suficientes__.\n**Faltante:**\n${missing.join('\n')}`)
            .setTimestamp();
    
            return message.reply({ embeds: [embed], ephemeral: true });
        }
    
        for (var material of data.item.materials) {
            await db.sub(`e_${message.guildId}_${message.userId}.inv.materials._${material.ref_id}`, material.amount * data.amount)
        }
    
        await db.add(`e_${message.guild.id}_${message.userId}.inv.objects._${data.item.id}`, data.amount);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.user.displayAvatarURL() })
        .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
        .setDescription(craft.txt[n].replace('{item}', data.item.name))
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}