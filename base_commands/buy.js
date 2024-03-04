const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { item, craft, amount }) => {
    const shop = await db.get(`g_${message.guildId}.shop`);
    const convertion = await db.get(`g_${message.guildId}.convertion`);
    message = fix(message);

    let pricePath = 'cash';
    let rewardPath = 'cash';

    if (data.item.price.type === 'inv.') 
        pricePath = 'inv.objects._' + data.craft.find(x => x.id === data.item.price.ref_id)?.id;

    if (data.item.reward.type === 'inv.') 
        rewardPath = 'inv.objects._' + data.craft.find(x => x.id === data.item.reward.ref_id)?.id;
    
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
        .setDescription(`Parece que no lo puedes comprar.\nFaltante: ${data.item.price.type === 'cash' ? convertion.emoji : '' } x${item.price.amount - current} ${data.item.price.type === 'cash' ? convertion.name : data.item.name }`)
        .setTimestamp()
        return message.reply({ embeds: [embed], ephemeral: true });
    }

    let text = `x${data.item.reward.amount} ${data.item.price.type === 'cash' 
    ? convertion.emoji + ' ' + convertion.name 
    : '**' + data.item.name + '**' }`;

    if (data.item.reward.type == 'role') {
        let role = await message.guild.roles.cache.find(x => x.id == data.item.reward.id);
        if (!role) return message.reply({ content: 'Rol no encontrado.' });

        try { 
            await message.member.roles.add(role);
        } catch (err) {
            text = `No tengo permisos suficientes para añadir el rol: <@&${data.item.reward.id}>`;
        }

        text = `<@&${data.item.reward.id}>`;

    } else await db.add(`e_${message.guildId}_${message.userId}.${rewardPath}`, data.item.reward.amount);

    await db.sub(`e_${message.guildId}_${message.userId}.${pricePath}`, data.item.price.amount);
    if (data.item.onlyOnce) await db.push(`e_${message.guildId}_${message.userId}.alreadyBought`, data.item.name);
    
    let embed = new EmbedBuilder()
    .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
    .setColor(0x56bb74)
    .setDescription(shop.txt.replace('{reward}', text))
    .setTimestamp();

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}