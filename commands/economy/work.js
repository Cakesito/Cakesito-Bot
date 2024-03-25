const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');
const default_economy = require('../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja y gana dinero')
    .setDescriptionLocalizations({
        "en-GB": "Work and earn money",
        "en-US": "Work and earn money"
    }),

    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db),

    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments, client.db),

    run: async (message, comments, db) => {
        message = fix(message);
    
        const work = await db.get(`g_${message.guildId}.work`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);
    
        if (!work.txt?.length) work.txt = default_economy.work.txt;
    
        let randomMoney = random(work.min, work.max);
        let randomText = work.txt[Math.floor(Math.random() * work.txt.length)];
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.user.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(randomText
            .replace('{money}', `${convertion.emoji} ${randomMoney} ${convertion.name}`)
            .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + work.cooldown) / 1000)}:t>`)
            .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + work.cooldown) / 1000)}:R>`))
        .setTimestamp();
    
        await db.add(`e_${message.guild.id}_${message.user.id}.cash`, randomMoney);
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}