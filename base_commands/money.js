const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { member, type, amount } ) => {
    message = fix(message);

    await db.add(`e_${data.member.guild.id}_${data.member.user.id}.${data.type}`, data.amount);

    let embed = new EmbedBuilder()
    .setDescription(`${amount} a ${data.member.displayName || data.member.user.username} (${type})`)
    .setTimestamp()
    .setColor(0x0099FF);

    return message.channel.send({ embeds: [embed] });
}