const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Comete un crimen'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const crime = await db.get(`g_${interaction.guildId}.crime`);

        let randomMoney = 0;
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setTimestamp();

        if ((Math.random() * 100) <= crime.pr) {
            randomMoney = random(crime.success.min, crime.success.max);

            let randomText = crime.success.txt[Math.floor(Math.random() * crime.success.txt.length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0x56bb74);
            await db.add(`e_${interaction.guildId}_${interaction.user.id}.cash`, randomMoney);
            
        } else {
            randomMoney = random(crime.fail.min, crime.fail.max);
            
            let randomText = crime.fail.txt[Math.floor(Math.random() * crime.fail.txt.length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0xec5454);
            await db.sub(`e_${interaction.guildId}_${interaction.user.id}.cash`, randomMoney);
        }

        return interaction.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}