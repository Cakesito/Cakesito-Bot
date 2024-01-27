const { EmbedBuilder } = require('discord.js');

module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let type = args[0];
        let amount, member;

        if(type != 'bank' || type != 'cash') {
            member = message.mentions.members.first() || message.guild.members.resolve(type);
            if(!member) return message.reply('No encontré el usuario.');
            
            amount = args[1];
            amount = Number(amount);

            if(isNaN(amount) || !amount) return message.reply('Señala una cantidad válida.');
            
        } else {

            if(isNaN(Number(type)) && type != 'cash' || type != 'bank') return message.reply('¿Dónde agregarás/quitarás el dinero?');
            
            member = message.mentions.members.first() || message.guild.members.resolve(args[1]);
            if(!member) return message.reply('No encontré el usuario.');
    
            amount = args[2];
            amount = Number(amount);
    
            if(isNaN(amount) || !amount) return message.reply('Señala una cantidad válida.');
        }

        type.startsWith('<@') ? type = 'cash' : type = args[0];

        await db.add(`e_${member.guild.id}_${member.user.id}.${type}`, amount);

        let embed = new EmbedBuilder()
        .setDescription(`${amount} a ${member.user.tag} (${type})`);

        return message.channel.send({ embeds: [embed] });
        
    }
}