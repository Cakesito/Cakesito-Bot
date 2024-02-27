const { EmbedBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        const daily = await db.get(`g_${message.guildId}.daily`);
        const materials = await db.get(`g_${message.guildId}.materials`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();

        if (!daily.txt?.length) daily.txt = default_economy.daily.txt;

        let reward = {};
        if (daily.reward.type == 'inv.') {
            for (x of Object.entries(daily.reward.materials)) {
                var amount = random(x[1][0], x[1][1]);
                if (amount == 0) return;
                
                let material = materials.find(k => k.name === x[0]);
                if (material) {
                    reward.material = x[0];
                    reward.materialAmount = amount;
                } else {
                    reward.object = x[0];
                    reward.objectAmount = amount;
                }

                await db.add(`e_${message.guild.id}_${message.author.id}.${daily.reward.type}${x[0]}`, amount);
            }

            embed.setDescription(daily.txt.replace('{objectName}', reward.object || '')
                .replace('{objectAmount}', reward.objectAmount || '')
                .replace('{materialName}', reward.material || '')
                .replace('{materialAmount}', reward.materialAmount || '')
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + daily.cooldown) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + daily.cooldown) / 1000)}:R>`));
            
        } else {
            await db.add(`e_${message.guild.id}_${message.author.id}.${daily.reward.type}`, daily.reward.amount);
            embed.setDescription(daily.txt
                .replace('{money}', daily.reward.amount + ' ' + convertion.cash)
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + daily.cooldown) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + daily.cooldown) / 1000)}:R>`));
        }

        return message.reply({ embeds: [embed] });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}