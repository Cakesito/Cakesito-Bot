const { work } = require('../../economy.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    // cooldown: work.cooldown || 0,
    tCooldown: work.tCooldown || null,
    run: async (client, message) => {

        const db = client.db.get('db');

        let randomMoney = random(work['min'], work['max']);
        let randomText = work['txt'][Math.floor(Math.random() * work['txt'].length)];

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(randomText.replace('{money}', randomMoney))
        .setTimestamp();

        await db.add(`e_${member.guild.id}_${message.author.id}.cash`, randomMoney);

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}