const { EmbedBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {

        const db = client.db.get('db');
        const work = await db.get(`g_${message.guildId}.work`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);

        if (!work.txt?.length) work.txt = default_economy.work.txt;

        let randomMoney = random(work.min, work.max);
        let randomText = work.txt[Math.floor(Math.random() * work.txt.length)];

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(randomText
            .replace('{money}', randomMoney + ' ' + convertion.cash)
            .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + work.cooldown) / 1000)}:t>`)
            .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + work.cooldown) / 1000)}:R>`))
        .setTimestamp();

        await db.add(`e_${message.guild.id}_${message.author.id}.cash`, randomMoney);

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}