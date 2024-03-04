const { EmbedBuilder } = require('discord.js');
const fix = require('./util/fix');

module.exports = async (message, db, data = { member }) => {

    message = fix(message);

    let bal = await db.get(`e_${message.guildId}_${data.member.user.id}`);
    const convertion = await db.get(`g_${message.guildId}.convertion`);
    if (!bal) bal = { cash: 0, bank: 0 };

    bal.cash = bal.cash ? bal.cash : 0;
    bal.bank = bal.bank ? bal.bank : 0;

    let balEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setAuthor({ name: data.member.user.displayName || data.member.user.username, iconURL: data.member.displayAvatarURL() })
    .addFields(
        { name: 'Cash', value: `${convertion.emoji ?? ''} ${bal.cash} ${convertion.name}`, inline: true },
        { name: 'Bank', value: `${convertion.emoji ?? ''} ${bal.bank} ${convertion.name}`, inline: true },
        { name: 'Total', value: `${convertion.emoji ?? ''} ${bal.cash + bal.bank} ${convertion.name}`, inline: true }
    )
    .setTimestamp();

    return message.reply({ embeds: [balEmbed] });
}