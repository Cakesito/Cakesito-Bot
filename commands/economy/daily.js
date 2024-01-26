const { daily } = require('../../economy.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: daily.cooldown || 0,
    run: async (client, message) => {
        const db = client.db.get('db');
        
        await db.add(`e_${member.guild.id}_${message.author.id}.cash`, daily.amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(daily.txt.replace('{money}', daily.amount))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}