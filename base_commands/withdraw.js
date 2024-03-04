const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { amount }) => {
    message = fix(message);

    const convertion = await db.get(`g_${message.guildId}.convertion`);

    await db.sub(`e_${message.guild.id}_${message.userId}.bank`, data.amount);
    await db.add(`e_${message.guild.id}_${message.userId}.cash`, data.amount);

    let embed = new EmbedBuilder()
    .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL()})
    .setColor(0x56bb74)
    .setDescription(`Has retirado ${convertion.emoji} ${data.amount} ${convertion.name} del banco!`)
    .setTimestamp();

    return message.reply({ embeds: [embed]});
}