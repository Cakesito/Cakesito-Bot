// const Economy = require('../../things/economy');
const { crime } = require('../../economy.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    // cooldown: crime.cooldown || 0,
    tCooldown: crime.tCooldown || null,
    run: async (client, message) => {

        const db = client.db.get('db');
        let randomMoney = 0;
        // let crimeCommand = new Economy().mixed('Crime', crime, message.author);

        let embed = new EmbedBuilder().setAuthor({ name: message.author.displayName || message.author.username, iconURL: message.author.displayAvatarURL() });

        if ((Math.random() * 100) <= crime.pr) {
            randomMoney = random(crime['win']['min'], crime['win']['max']);

            let randomText = crime['win']['txt'][Math.floor(Math.random() * crime['win']['txt'].length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0x56bb74);

        } else {
            randomMoney = random(crime['loose']['min'], crime['loose']['max']);

            let randomText = crime['loose']['txt'][Math.floor(Math.random() * crime['loose']['txt'].length)];
            embed.setDescription(randomText.replace('{money}', randomMoney));
            embed.setColor(0xec5454);
        }

        await db.add(`e_${message.author.id}.cash`, randomMoney);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

        
        // await db.add(`e_${message.author.id}.inv.obj.${crimeCommand.obj.obj}`, crimeCommand.obj.amount);

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}