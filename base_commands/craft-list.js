const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db) => {
    message = fix(message);
    
    const items = await db.get(`g_${message.guildId}.craft.items`);
    if(!items.length) return message.reply({ content: 'No hay objetos que crear.', ephemeral: true });
    const materials = await db.get(`g_${message.guildId}.materials`);
    
    let embed = new EmbedBuilder()
    .setAuthor({ name: `${message.guild.name} Objetos creables` })
    .addFields()
    .setColor(0x0099FF)

    items.forEach(item => {
        return embed.addFields({ 
            name: item.name,
            value: `${item.description ?? '_Este objeto no tiene descripción_'}\n${item.materials.map(x => `x${x.amount} **${materials.find(k => k.id === x.ref_id)?.name}**`)}` 
        });
    });

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}