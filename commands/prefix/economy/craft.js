const craft = require('../../../base_commands/craft');

module.exports = {
    run: async (client, message, args) => {
        const db = client.db.get('db');
        const items = await db.get(`g_${message.guildId}.craft.items`);
        if (!items.length) return message.reply('Este comando no está disponible en este servidor.');

        let item, amount;

        if (!args[0]) return message.reply('Indica una cantidad y/o un objeto.');

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply('Vas a crear un... ¿qué?')
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(`Vas a crear ${amount}... ¿qué?`);
        }

        var temp = item.toLowerCase();
        item = items.find(x => x.name === temp);
        if (!item) item = items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply('No encontré el objeto `' + temp + '`.');
        
        craft(message, db, { item: item, amount: amount });
    }
}