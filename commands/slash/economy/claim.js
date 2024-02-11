const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Reclama una recompensa'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const claim = await db.get(`g_${interaction.guildId}.claim`);
        const convertion = await db.get(`g_${interaction.guildId}.convertion`);

        let desc = [`x${claim.reward.amount || 1} ${convertion[item.price.type] || item.price.type.replace('inv.', '')}`];
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(claim.txt.replace('{reward}', desc.join(', ')))
        .setTimestamp();
        
        if (claim.reward.type == 'inv.') {
            desc = [];
            for (x of Object.entries(claim.reward.materials)) {
                var amount = random(x[1][0], x[1][1]);
                if (amount == 0) return;

                desc.push(`x${amount} **${x[0]}**`);
                await db.add(`e_${interaction.guildId}_${interaction.user.id}.${claim.reward.type}${x[0]}`, amount);
            }

            embed.setDescription(claim.txt.replace('{reward}', desc.join(', ')));

        } else await db.add(`e_${interaction.guildId}_${interaction.user.id}.${claim.reward.type}`, claim.reward.amount);
        
        return interaction.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}
