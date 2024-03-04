const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { item, amount }) => {
    message = fix(message);
    
    const items = await db.get(`g_${message.guildId}.craft.items`);
    const materials = await db.get(`g_${message.guildId}.materials`);

    const n = Math.floor(Math.random() * 100) <= data.item.probability ? 'success' : 'fail';

    const inv = await db.get(`e_${message.guildId}_${message.user.id}.inv.materials`);
    var missing = [];

    // Quick.db doesn't work in forEach
    for (var material of data.item.materials) {
        if (!inv[material.ref_id] || (material.amount * data.amount) > inv[material.ref_id]) {
            var mat = materials.find(x => x.id === material.ref_id);
            missing.push(`x${(material.amount * data.amount) - (inv[material.ref_id] || 0)} **${mat.name}** (${inv[material.ref_id] || 0}/${material.amount * data.amount})`);
        }
    }
    
    if(missing.length) {
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setColor(0xec5454)
        .setDescription(`Parece que no tienes los __recursos suficientes__.\n\n**Faltante:**\n${missing.join('\n')}`)
        .setTimestamp();

        return message.reply({ embeds: [embed], ephemeral: true });
    }

    for (var material of data.item.materials) {
        await db.sub(`e_${message.guildId}_${message.userId}.inv.materials._${material.ref_id}`, material.amount * data.amount)
    }

    await db.add(`e_${message.guild.id}_${message.userId}.inv.objects._${data.item.id}`, data.amount);
    
    let embed = new EmbedBuilder()
    .setAuthor({ name: message.member.displayName || message.user.tag, iconURL: message.user.displayAvatarURL() })
    .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
    .setDescription(craft.txt[n].replace('{item}', items.find(x => x.id === data.item.ref_id)?.name ))
    .setTimestamp();

    return message.reply({ embeds: [embed] });
}