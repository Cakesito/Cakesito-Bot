const { EmbedBuilder } = require('discord.js');
const default_economy = require('../default_economy.json');
const fix = require('./util/fix');

module.exports = async (message, db) => {
    message = fix(message);

    const economy = await db.get(`g_${message.guildId}`);

    const claim = economy.claim;
    const materials = economy.materials;
    const items = economy.craft.items;
    const convertion = economy.convertion;
    
    let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.tag, iconURL: message.user.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();

    if (!claim.txt?.length) claim.txt = default_economy.claim.txt;

    var materialReward = {};
    var objectReward = {};

    if (claim.reward.type == 'inv.') {

        for (var material of claim.reward.materials) {
            var amount = random(material.amount[0], material.amount[1]);
            if (amount === 0) continue;
    
            var mat = materials.find(x => x.id === material.ref_id);
            if (mat) { 
                materialReward.name = mat.name;
                materialReward.amount = amount;
                await db.add(`e_${message.guildId}_${message.user.id}.inv.materials._${mat.id}`, 1);
                continue;
            }
            
            if (!mat) mat = items.find(x => x.id === material.ref_id);
            if (mat) { 
                objectReward.name = mat.name;
                objectReward.amount = amount;
                await db.add(`e_${message.guildId}_${message.user.id}.inv.objects._${mat.id}`, 1);
            }
        }

        embed.setDescription(claim.txt
            .replace('{objectName}', objectReward.name || '')
            .replace('{objectAmount}', objectReward.amount || '')
            .replace('{materialName}', materialReward.name || '')
            .replace('{materialAmount}', materialReward.amount || '')
            .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + claim.cooldown) / 1000)}:t>`)
            .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + claim.cooldown) / 1000)}:R>`));
        
    } else {
        await db.add(`e_${message.guild.id}_${message.user.id}.cash`, claim.reward.amount);
        embed.setDescription(claim.txt
            .replace('{money}', `${convertion.emoji} ${claim.reward.amount} ${convertion.name}`)
            .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + claim.cooldown) / 1000)}:t>`)
            .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + claim.cooldown) / 1000)}:R>`));
    }

    return message.reply({ embeds: [embed] });

}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}