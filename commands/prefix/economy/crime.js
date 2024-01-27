// const Economy = require('../../things/economy');
const { crime } = require('../../../economy.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: crime.cooldown || 0,
    tCooldown: crime.tCooldown || null,
    run: async (client, message) => {

        const db = client.db.get('db');
        let randomMoney = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.displayName || message.author.username, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

        if ((Math.random() * 100) <= crime.pr) {
            randomMoney = random(crime.success.min, crime.success.max);

            let randomText = crime.success.txt[Math.floor(Math.random() * crime.success.txt.length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0x56bb74);

        } else {
            randomMoney = random(crime.fail.min, crime.fail.max);

            let randomText = crime.fail.txt[Math.floor(Math.random() * crime.fail.txt.length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0xec5454);
        }

        await db.add(`e_${message.guild.id}_${message.author.id}.cash`, randomMoney);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}