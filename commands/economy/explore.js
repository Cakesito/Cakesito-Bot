const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const default_economy = require('../../default_economy.json');
const fix = require('../util/fix');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explora la zona'),

    runPrefix: (client, message) => module.exports.run(message, client.db),

    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);
    
        const explore = await db.get(`g_${message.guildId}.explore`);
        const materials = await db.get(`g_${message.guildId}.materials`);
    
        if (!explore.materials.length) return message.reply('Este comando no está disponible en este servidor.');
    
        if (!explore.txt?.success?.length) explore.txt.success = default_economy.explore.txt.success;
        if (!explore.txt?.fail?.length) explore.txt.fail = default_economy.explore.txt.fail;
        
        let reward = [];
        var success = false;
    
        if ((Math.random() * 100) <= explore.probability) {
            success = true;
            for (var material of shuffle(explore.materials)) {
                if (reward.length >= explore.maxMaterials) break;
                
                var amount = random(material.amount[0], material.amount[1]);
                if (amount === 0) continue;
        
                var mat = materials.find(x => x.id === material.ref_id);
                if (mat) reward.push({ name: mat.name, amount: amount });
                
                await db.add(`e_${message.guildId}_${message.user.id}.inv.materials._${mat.id}`, amount);
            }
        }
        
        let randomText = success
        ? explore.txt.success[Math.floor(Math.random() * explore.txt.success.length)]
        .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:t>`)
        .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:R>`)
        
        : explore.txt.fail[Math.floor(Math.random() * explore.txt.fail.length)]
        .replace('{timestampUntil}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:t>`)
        .replace('{timestampLeft}', `<t:${Math.floor((Date.now() + explore.cooldown) / 1000)}:R>`);
    
        let coincidence = randomText.split(/\[([\s\S][^\[\]]+)\]/ig);
        if (coincidence[1]) {
            coincidence.forEach((con, i) => {
                if (i % 2 == 0) return;
                if (!con.includes('{materialName}') && !con.includes('{materialAmount}')) return;
    
                var parsed = "";
    
                reward.forEach(x => {
                    parsed = parsed + con
                    .replace('{materialName}', x.name)
                    .replace('{materialAmount}', String(x.amount))
                });
    
                coincidence[i] = parsed;
            });
    
            randomText = coincidence.join('');
        }
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
        .setTimestamp()
        .setDescription(randomText)
        .setColor(success ? 0x56bb74 : 0xec5454);
                
        return message.reply({ embeds: [embed] });
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}