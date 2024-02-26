const { EmbedBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        const claim = await db.get(`g_${message.guildId}.claim`);
        const materials = await db.get(`g_${message.guildId}.materials`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();

        if (!claim.txt?.length) claim.txt = default_economy.claim.txt;
        
        let reward = {};
        if (claim.reward.type == 'inv.') {
            for (x of Object.entries(claim.reward.materials)) {
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

                await db.add(`e_${message.guild.id}_${message.author.id}.${claim.reward.type}${x[0]}`, amount);
            }

            embed.setDescription(claim.txt.replace('{objectName}', reward.object || '')
                .replace('{objectAmount}', reward.objectAmount || '')
                .replace('{materialName}', reward.material || '')
                .replace('{materialAmount}', reward.materialAmount || ''));
            
        } else {
            await db.add(`e_${message.guild.id}_${message.author.id}.${claim.reward.type}`, claim.reward.amount);
            embed.setDescription(claim.txt.replace('{money}', claim.reward.amount));
        }

        return message.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}