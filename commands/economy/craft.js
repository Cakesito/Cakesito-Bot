const { EmbedBuilder } = require('discord.js');
const { craft } = require('../../economy.json');

let b = {
    'leche': ':milk: Leche',
    'polvo': ':sparkles: Polvo',
    'quesoken': 'token'
}

module.exports = {
    run: async (client, message, args) => {
        let db = client.db.get('db');

        // await db.add(`e_${message.author.id}.inv.obj.leche`, 50);
        // await db.add(`e_${message.author.id}.inv.obj.polvo`, 50);

        let recipe, current;
        let item = args.slice(1).join(' ');
        let amount = Number(args[0]);

        if(isNaN(amount)) {
            item = args.join(' ');
            if(!item) return message.reply('¿Qué vas a fabricar?');
            
            if(!Object.keys(craft.items).includes(item.toLowerCase())) return message.reply(`No encontré la receta de "${item}".` );
    
            recipe = craft.items[item.toLowerCase()];
            current = await db.get(`e_${member.guild.id}_${message.author.id}.inv.obj`) || { leche: 0, polvo: 0 };
            amount = null;
            
        } else if(amount && isNaN(amount)) return message.reply('Señala una cantidad válida.');

        if(amount) {
            let hrecipe = {};
            Object.entries(recipe).forEach(e => {
                let help = `{ "${e[0]}": ${e[1] * amount} }`;
                hrecipe = {...hrecipe, ...JSON.parse(help)};
            });
            recipe = hrecipe;
        }

        let can, faltante = [];
        Object.entries(current).forEach(e => {
            if(e[0] != '-') {
                if(current == -1 || current[e[0]] < recipe[e[0]]) { 
                    faltante.push(`${e[0]} (x${recipe[e[0]] - current[e[0]]})`);
                    return can = false;
                }

                can = true;
            }
        });
        
        if(!can) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no tienes los __recursos suficientes__.\n\n**Faltante:**\n${bonito(faltante.join('\n'))}`)
            .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
        await db.sub(`e_${member.guild.id}_${message.author.id}.inv.obj.leche`, recipe['leche']);//no fufa en loop
        await db.sub(`e_${member.guild.id}_${message.author.id}.inv.obj.polvo`, recipe['polvo']);
        
        let n = Math.floor(Math.random() * 100);
        let w = 0;
        if(n <= craft.pr) {
            await db.add(`e_${member.guild.id}_${message.author.id}.inv.obj.${item.toLowerCase()}`, amount || 1);
            w = 1;
        }
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(w != 1 ? 0x56bb74 : 0xec5454)
        .setDescription(craft.txt[w].replace('{obj}', bonito(item.toLowerCase())))
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}

function bonito (str) {
    let nstr = str;
    Object.keys(b).forEach(e => nstr = nstr.replace(e, b[e]));
    return nstr;
}
