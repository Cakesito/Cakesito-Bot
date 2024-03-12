const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const default_economy = require('../../default_economy.json');
const fix = require('../util/fix');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Comete un crimen'),

    runPrefix: (client, message) => module.exports.run(message, client.db),

    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);
        
        const crime = await db.get(`g_${message.guildId}.crime`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);
    
        let randomMoney = 0;
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setTimestamp();
    
        if (!crime.success.txt?.length) crime.success.txt = default_economy.crime.success.txt;
        if (!crime.fail.txt?.length) crime.fail.txt = default_economy.crime.fail.txt;
    
        if ((Math.random() * 100) <= crime.probability) {
            randomMoney = random(crime.success.min, crime.success.max);
    
            let randomText = crime.success.txt[Math.floor(Math.random() * crime.success.txt.length)];
            embed.setDescription(randomText
                .replace('{money}', `${convertion.emoji} ${randomMoney} ${convertion.name}`)
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:R>`));
            embed.setColor(0x56bb74);
            await db.add(`e_${message.guild.id}_${message.user.id}.cash`, randomMoney);
            
        } else {
            randomMoney = random(crime.fail.min, crime.fail.max);
            
            let randomText = crime.fail.txt[Math.floor(Math.random() * crime.fail.txt.length)];
            embed.setDescription(randomText
                .replace('{money}', `${convertion.emoji} ${randomMoney} ${convertion.name}`)
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:R>`));
                
            embed.setColor(0xec5454);
            await db.sub(`e_${message.guildId}_${message.user.id}.cash`, randomMoney);
        }
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}