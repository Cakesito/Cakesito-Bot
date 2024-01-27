const { explore } = require('../../../economy.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: explore.cooldown || 0,
    tCooldown: explore.tCooldown || null,
    run: async (client, message) => {
        const db = client.db.get('db');
        
        let desc = [];
        for (x of Object.entries(explore.materials)) {
            var amount = random(x[1][0], x[1][1]);
            if (amount == 0) continue;

            desc.push(`x${amount} **${x[0]}**`);
            await db.add(`e_${message.guild.id}_${message.author.id}.inv.${x[0]}`, amount);
        }
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.username, iconURL: message.member.displayAvatarURL() })
        .setTimestamp()
        .setDescription(desc.length ? explore.txt.success.replace('{reward}', desc.join(', ')) : explore.txt.fail)
        .setColor(desc.length ? 0x56bb74 : 0xec5454);
                
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}