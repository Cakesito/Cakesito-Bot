const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama una recompensa diaria'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const daily = await db.get(`g_${interaction.guildId}.daily`);
        const materials = await db.get(`g_${interaction.guildId}.materials`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();
        
        if (!daily.txt?.length) daily.txt = default_economy.daily.txt;

        let reward = {};
        if (daily.reward.type == 'inv.') {
            for (x of Object.entries(daily.reward.materials)) {
                var amount = random(x[1][0], x[1][1]);
                if (amount == 0) return;
                
                let material = materials.find(x => x.name === x[0]);
                if (material) {
                    reward.material = x[0];
                    reward.materialAmount = amount;
                } else {
                    reward.object = x[0];
                    reward.objectAmount = amount;
                }

                await db.add(`e_${interaction.guild.id}_${interaction.user.id}.${daily.reward.type}${x[0]}`, amount);
            }

            embed.setDescription(daily.txt.replace('{objectName}', reward.object || '')
                .replace('{objectAmount}', reward.objectAmount || '')
                .replace('{materialName}', reward.material || '')
                .replace('{materialAmount}', reward.materialAmount || ''));
            
        } else {
            await db.add(`e_${interaction.guildId}_${interaction.user.id}.${daily.reward.type}`, daily.reward.amount);
            embed.setDescription(daily.txt.replace('{money}', daily.reward.amount));
        }

        return interaction.reply({ embeds: [embed] });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}