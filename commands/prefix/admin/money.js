const { EmbedBuilder } = require('discord.js');

module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member && Number(args[0])) member = await message.guild.members.fetch(args[0]);
        if (!member && !Number(args[0])) member = await message.guild.members.search(args[0]);
        if (member && member.user.bot) return member.reply('El usuario seleccionado es un bot.');

        if (!member) return message.reply('No encontré al usuario.');

        let amount = args[1];
        let type = args[2] || 'cash';

        if (!Number(amount)) return message.reply('Señala una cantidad válida (puede ser negativa).');
        amount = Number(amount);

        if (type != 'cash' && type != 'bank') return message.reply('Señala una ubicación válida para el dinero (cash/bank).')

        await db.add(`e_${member.guild.id}_${member.user.id}.${type}`, amount);

        let embed = new EmbedBuilder()
        .setDescription(`${amount} a ${member.user.tag} (${type})`)
        .setTimestamp()
        .setColor(0x0099FF);

        return message.channel.send({ embeds: [embed] });
        
    }
}