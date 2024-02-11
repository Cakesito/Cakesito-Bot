const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama una recompensa diaria'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const daily = await db.get(`g_${interaction.guildId}.daily`);
        const convertion = await db.get(`g_${interaction.guildId}.convertion`);
        
        let desc = [`x${daily.reward.amount || 1} ${convertion[daily.reward.type].replace('inv.', '')}`];

        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(daily.txt.replace('{reward}', daily.reward.amount))
        .setTimestamp();

        if (daily.reward.type == 'inv.') {
            desc = [];
            for (x of Object.entries(daily.reward.materials)) {
                var amount = random(x[1][0], x[1][1]);
                if (amount == 0) return;
                
                desc.push(`x${amount} **${x[0]}**`);
                await db.add(`e_${interaction.guildId}_${interaction.user.id}.${daily.reward.type}${x[0]}`, amount);
            }

            embed.setDescription(daily.txt.replace('{reward}', desc.join(', ')));
            
        } else await db.add(`e_${interaction.guildId}_${interaction.user.id}.${daily.reward.type}`, daily.reward.amount);

        return interaction.reply({ embeds: [embed] });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}