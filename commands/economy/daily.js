const { EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const { dailyFrom } = require('../../config.json');
const fix = require('../util/fix');

module.exports = {
    daily: true,
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama una recompensa diaria'),

    runPrefix: (client, message) => module.exports.run(message, client.db),

    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);

        const settings = await db.get(`g_${message.guildId}`);
    
        const daily = settings.daily;
        const materials = settings.materials;
        const convertion = settings.convertion;
        const items = settings.craft.items;
    
        const availableFrom = parseTime(dailyFrom);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();
    
        if (!daily.txt?.length) daily.txt = default_economy.daily.txt;
    
        var materialReward = {};
        var objectReward = {};
    
        if (daily.reward.type == 'inv.') {
    
            for (var material of daily.reward.materials) {
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
    
            embed.setDescription(daily.txt
                .replace('{objectName}', objectReward.name || '')
                .replace('{objectAmount}', objectReward.amount || '')
                .replace('{materialName}', materialReward.name || '')
                .replace('{materialAmount}', materialReward.amount || '')
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:R>`));
            
        } else {
            await db.add(`e_${message.guild.id}_${message.user.id}.cash`, daily.reward.amount);
            embed.setDescription(daily.txt
                .replace('{money}', `${convertion.emoji} ${daily.reward.amount} ${convertion.name}`)
                .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:t>`)
                .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:R>`));
        }
    
        return message.reply({ embeds: [embed] });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date;
}