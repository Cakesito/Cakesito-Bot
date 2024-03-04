const money = require('../../../base_commands/money');

module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');

        const cache = message.guild.members.cache.map(x => {
            return { id: x.id, member: x };
        });

        let member = message.mentions.members.first() || cache.find(x => x.id === args[0])?.member;
        if (!member && Number(args[0])) member = await message.guild.members.fetch(args[0]);
        if (!member && !Number(args[0])) member = await message.guild.members.search({ query: args[0], limit: 1 });
        if (member && member.user.bot) return member.reply('El usuario seleccionado es un bot.');

        if (!member) return message.reply('No encontré al usuario.');

        let amount = args[1];
        let type = args[2] || 'cash';

        if (!Number(amount)) return message.reply('Señala una cantidad válida (puede ser negativa).');
        amount = Number(amount);

        if (type != 'cash' && type != 'bank') return message.reply('Señala una ubicación válida para el dinero (cash/bank).');

        money(message, db, { member: member, type: type, amount: amount });
        
    }
}