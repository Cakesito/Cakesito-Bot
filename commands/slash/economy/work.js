const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja y gana dinero'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const work = await db.get(`g_${interaction.guildId}.work`);

        let randomMoney = random(work.min, work.max);
        let randomText = work.txt[Math.floor(Math.random() * work.txt.length)];

        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(randomText.replace('{money}', randomMoney))
        .setTimestamp();

        await db.add(`e_${interaction.guild.id}_${interaction.user.id}.cash`, randomMoney);

        return interaction.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}