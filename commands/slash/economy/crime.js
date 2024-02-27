const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Comete un crimen'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const crime = await db.get(`g_${interaction.guildId}.crime`);
        const convertion = await db.get(`g_${interaction.guildId}.convertion`);

        let randomMoney = 0;
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setTimestamp();

        if (!crime.success.txt?.length) crime.success.txt = default_economy.crime.success.txt;
        if (!crime.fail.txt?.length) crime.fail.txt = default_economy.crime.fail.txt;

        if ((Math.random() * 100) <= crime.probability) {
            randomMoney = random(crime.success.min, crime.success.max);

            let randomText = crime.success.txt[Math.floor(Math.random() * crime.success.txt.length)];
            embed.setDescription(randomText.replace('{money}', randomMoney + convertion.cash));
            embed.setColor(0x56bb74);
            await db.add(`e_${interaction.guildId}_${interaction.user.id}.cash`, randomMoney);
            
        } else {
            randomMoney = random(crime.fail.min, crime.fail.max);
            
            let randomText = crime.fail.txt[Math.floor(Math.random() * crime.fail.txt.length)];
            embed.setDescription(randomText
                .replace('{money}', randomMoney + ' ' + convertion.cash)
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + crime.cooldown) / 1000)}:R>`));
                
            embed.setColor(0xec5454);
            await db.sub(`e_${interaction.guildId}_${interaction.user.id}.cash`, randomMoney);
        }

        return interaction.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}