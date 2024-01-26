const { EmbedBuilder } = require('discord.js');
const { shop } = require('../../economy.json');

let b = {
    'leche': ':milk: Leche',
    'polvo': ':sparkles: Polvo',
    'quesoken': 'Quesoken',
    'qk': 'Quesoken',
    'qc': '<:star:991110840780599336> Quesocoins'
}

let c = {
    'qk': 'inv.obj.quesoken',
    'qc': 'cash'
}

module.exports = {
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let price, current, can;
        let item = args.slice(1).join(' ').toLowerCase();
        let amount = Number(args[0]);

        if(isNaN(amount)) {
            item = args.join(' ');
            if(!item) return message.reply('¿Qué vas a comprar?');
            amount = 1;
            
        } else { 
            if(amount && isNaN(amount)) return message.reply('Señala una cantidad válida.');
            item = args.slice(1).join(' ');
        }

        if(!Object.keys(shop).includes(item)) return message.reply(`No encontré el item "${item}".`);
        
        Object.keys(shop[item.toLowerCase()]).forEach(e => {
            if(c[e.substring(6)]) price = { type: c[e.substring(6)], price: shop[item][e], f: e.substring(6) }
        });

        current = await db.get(`e_${member.guild.id}_${message.author.id}.${price.type}`) || 0;
        
        if(amount) price.price = price.price * amount;
        
        can = false;
        if(current > price.price) can = true;
        
        if(!can || !current) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no tienes dinero suficiente.\nFaltante: ${bonito(price.f)} (x${price.price - current})`)
            .setTimestamp()
            return message.reply({ embeds: [embed] });
        }

        let reward = shop[item].reward;
        let rewardText = 'Nada';
        if(reward.type == 'qc' || reward.type == 'qk') {
            let type = c[reward.type];

            await db.add(`e_${member.guild.id}_${message.author.id}.${type}`, reward.amount);
            await db.sub(`e_${member.guild.id}_${message.author.id}.${price.type}`, price.price);
            
            rewardText = `${bonito(reward.type)} (x${reward.amount})`;
        }
        
        if(reward.type == 'role') {
            await db.sub(`e_${member.guild.id}_${message.author.id}.${price.type}`, price.price);
            
            let role = message.guild.roles.cache.filter(x => x.id == reward.role);
            if(!role) return message.reply('Ouups');

            message.member.roles.add(role);
            rewardText = `<@&${reward.role}>`;
        }

        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(shop[item].txt.replace('{reward}', rewardText))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}

function bonito (str) {
    let nstr = str;
    Object.keys(b).forEach(e => { 
        nstr = nstr.replace(e, b[e]) 
    });
    return nstr;
}