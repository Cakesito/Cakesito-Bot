const withdraw = require('../../../base_commands/withdraw');

module.exports = {
    aliases: ['with'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        
        let current = await db.get(`e_${message.guild.id}_${message.author.id}.bank`) || 0;

        let amount = Number(args[0]);
        if(!amount || isNaN(amount) && amount != 'all' ||isNaN(amount) && amount != 'max') return message.reply('¿Cuánto dinero retirarás?');
        
        if(amount == 'all' || amount == 'max') amount = current;
        if(current <= 0 || amount > current) return message.reply(`Parece que no tienes suficiente.\nFaltante: ${convertion.emoji} ${amount - current} ${convertion.name}`);

        withdraw(message, db, { amount: amount });
    }
}