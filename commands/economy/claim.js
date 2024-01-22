const { EmbedBuilder } = require('discord.js');
const { claim } = require('../../economy.json');

let b = {
    'leche': ':milk: Leche',
    'polvo': ':sparkles: Polvo',
    'quesoken': 'Quesoken'
}

module.exports = {
    cooldown: claim.cooldown || 0,
    run: async (client, message) => {
        const db = client.db.get('db');
        
        let obj = {};
        Object.entries(claim.oam).forEach(e => {
            let r = random(e[1][0], e[1][1]);
            let help = `{ "${e[0]}": ${r} }`;

            obj = { ...obj, ...JSON.parse(help) };
        });

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setColor(0x56bb74)
        .setTimestamp();

        let desc = Object.keys(obj).map(e => {
            return `${e} (x${obj[e]})`;
        });

        await db.add(`e_${message.author.id}.inv.obj.leche`, obj['leche']); // no fufa en un loop :c
        await db.add(`e_${message.author.id}.inv.obj.polvo`, obj['polvo']);

        embed.setDescription(bonito(claim.txt.replace('{obj}', desc.join(' '))));
        
        return message.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function bonito (str) {
    let nstr = str;
    Object.keys(b).forEach(e => nstr = nstr.replace(e, b[e]));
    return nstr;
}
