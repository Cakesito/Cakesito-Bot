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
        
        let reward = [];
        var success = false;

        if ((Math.random() * 100) <= explore.probability) {
            for (x of shuffle(Object.entries(explore.materials))) {
                // x[0] = name, x[1] = [min, max]
                if (reward.length >= explore.maxMaterials) break;
                
                var amount = random(Number(x[1][0]), Number(x[1][1]));
                if (amount === 0) continue;
    
                let material = materials.find(k => k.name === x[0]);
                if (material) {
                    reward.push({ name: x[0], amount: amount });
                } else continue;
    
                success = true;
                await db.add(`e_${message.guild.id}_${message.author.id}.inv.${x[0]}`, amount);
            }
        }
        
        let randomText = success ? explore.txt.success[Math.floor(Math.random() * explore.txt.success.length)]
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