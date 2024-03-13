const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,

    runPrefix: async (client, message, args) => {
        const db = client.db;
        const shop = await db.get(`g_${message.guildId}.shop`);
        if (!shop.items.length) return message.reply('Este comando no está disponible en este servidor.');
        const items = await db.get(`g_${message.guildId}.craft.items`);

        let item, amount;

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

        var temp = item.toLowerCase();
        item = shop.items.find(x => x.name === temp);
        if (!item) item = shop.items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = shop.items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply('No encontré el objeto `' + temp + '`.');

        module.exports.run(message, db, { item: item, craft: items, amount: amount });
    },

    runSlash: async (client, interaction) => {
        const db = client.db;
        const shop = await db.get(`g_${interaction.guildId}.shop`);
        if (!shop.items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true});
        const items = await db.get(`g_${interaction.guildId}.craft.items`);

        let item = shop.items.find(x => x.name == interaction.options.getString('objeto'));
        if (!item) return interaction.reply({ content: 'No encontré el objeto `' + interaction.options.getString('objeto') + '`.', ephemeral: true });
        let amount = interaction.options.getInteger('cantidad') || 1;

        module.exports.run(interaction, db, { item: item, craft: items, amount: amount });
    },

    run: async (message, db, data = { item, craft, amount }) => {
        const shop = await db.get(`g_${message.guildId}.shop`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);

        message = fix(message);
    
        let pricePath = 'cash';
        let rewardPath = 'cash';

    
        if (data.item.price.type === 'inv.') {
            var obj = data.craft.find(x => x.id === data.item.price.ref_id);
            if (!obj) return message.reply({ content: 'No pude encontrar el objeto.', ephemeral: true });
            pricePath = 'inv.objects._' + obj.id;
        }

        if (data.item.reward.type === 'inv.') {
            var obj = data.craft.find(x => x.id === data.item.reward.ref_id);
            if (!obj) return message.reply({ content: 'No pude encontrar el objeto.', ephemeral: true });
            rewardPath = 'inv.objects._' + obj.id;
        }
        
        const current = await db.get(`e_${message.guildId}_${message.userId}.${pricePath}`) || 0;
        const hasBought = await db.get(`e_${message.guildId}_${message.userId}.alreadyBought`) || [];
    
        if (data.item.onlyOnce && hasBought.includes(data.item.name)) return message.reply({ content: 'Ya has comprado este objeto.', ephemeral: true });
        if (data.amount > 1 && data.item.reward.type == 'role') return message.reply({ content: `Solo puedes comprar uno.`, ephemeral: true });
    
        data.item.reward.amount = data.item.reward.amount * data.amount;
        data.item.price.amount = data.item.price.amount * data.amount;
        
        if (current < data.item.price.amount) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no lo puedes comprar.\nFaltante: ${data.item.price.type === 'cash' ? convertion.emoji : '' } x${data.item.price.amount - current} ${data.item.price.type === 'cash' ? convertion.name : data.item.name }`)
            .setTimestamp()
            return message.reply({ embeds: [embed], ephemeral: true });
        }
    
        var text = '';
        if (data.item.reward.type === 'cash') text = `${convertion.emoji} ${data.item.reward.amount} ${convertion.name}`;
        if (data.item.reward.type === 'inv.') text = `x${data.item.reward.amount} **${data.craft.find(x => x.id === data.item.reward.ref_id)?.name}**`
    
        if (data.item.reward.type == 'role') {
            let role = await message.guild.roles.cache.find(x => x.id == data.item.reward.id);
            if (!role) return message.reply({ content: 'Rol no encontrado.' });
    
            try { 
                await message.member.roles.add(role);
            } catch (err) {
                text = `No tengo permisos suficientes para añadir el rol: <@&${data.item.reward.id}>`;
            }
    
            text = `<@&${data.item.reward.id}>`;
    
        } else { 
            await db.add(`e_${message.guildId}_${message.userId}.${rewardPath}`, data.item.reward.amount);
        }
    
        await db.sub(`e_${message.guildId}_${message.userId}.${pricePath}`, data.item.price.amount);
        if (data.item.onlyOnce) await db.push(`e_${message.guildId}_${message.userId}.alreadyBought`, data.item.name);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(shop.txt.replace('{reward}', text))
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}