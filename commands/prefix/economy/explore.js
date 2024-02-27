const { EmbedBuilder } = require('discord.js');
const default_economy = require('../../../default_economy.json');

module.exports = {
    requiresCooldown: true,
    run: async (client, message) => {
        const db = client.db.get('db');
        const explore = await db.get(`g_${message.guildId}.explore`);
        const materials = await db.get(`g_${message.guildId}.materials`);

        if (!Object.keys(explore.materials).length) return message.reply('Este comando no está disponible en este servidor.');

        if (!explore.txt?.success?.length) explore.txt.success = default_economy.explore.txt.success;
        if (!explore.txt?.fail?.length) explore.txt.fail = default_economy.explore.txt.fail;
        
        let reward = {};
        var success = false;
        for (x of Object.entries(explore.materials)) {
            var amount = random(Number(x[1][0]), Number(x[1][1]));
            if (amount == 0) continue;

            let material = materials.find(k => k.name === x[0]);
            if (material) {
                reward.material = x[0];
                reward.materialAmount = amount;
            } else {
                reward.object = x[0];
                reward.objectAmount = amount;
            }

            success = true;
            await db.add(`e_${message.guild.id}_${message.author.id}.inv.${x[0]}`, amount);
        }
        
        let randomText = success ? explore.txt.success[Math.floor(Math.random() * explore.txt.success.length)]
        .replace('{objectName}', reward.object || '')
        .replace('{objectAmount}', reward.objectAmount || '')
        .replace('{materialName}', reward.material || '')
        .replace('{materialAmount}', reward.materialAmount || '')
        .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:t>`)
        .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:R>`) 
        
        : explore.txt.fail[Math.floor(Math.random() * explore.txt.fail.length)]
        .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:t>`)
        .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:R>`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.username, iconURL: message.member.displayAvatarURL() })
        .setTimestamp()
        .setDescription(randomText)
        .setColor(success ? 0x56bb74 : 0xec5454);
                
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}