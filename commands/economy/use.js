const { EmbedBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    deactivated: true,

    runPrefix: async (client, message, args) => { 
        const db = client.db;
        const craft = await db.get(`g_${message.guildId}.craft`);
        if (!craft.items.length) return message.reply('Este comando no está disponible en este servidor.');

        let item, amount;

        if (!args[0]) return message.reply('Indica una cantidad y/o un objeto.');

        if (isNaN(Number(args[0]))) {
            amount = 1;
            item = args.slice(0).join(' ').toLowerCase();

            if (!item) return message.reply('Vas a comprar un... ¿qué?')
        } else {
            amount = Number(args[0]);
            item = args.slice(1).join(' ').toLowerCase();

            if (!item) return message.reply(`Vas a comprar ${amount}... ¿qué?`);
        }

        var temp = item.toLowerCase();
        item = craft.items.find(x => x.name === temp);
        if (!item) item = craft.items.find(x => x.name.toLowerCase().startsWith(temp));
        if (!item) item = craft.items.find(x => x.name.toLowerCase().includes(temp));

        if (!item) return message.reply('No encontré el objeto `' + temp + '`.');

        module.exports.run(message, db, { amount: amount, item: item, craft: craft });

    },
    
    runSlash: async (client, interaction) => { 
        const db = client.db;
        const craft = await db.get(`g_${interaction.guildId}.craft`);
        if (!craft.items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = craft.items.find(x => x.id == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (!item) return interaction.reply({ content: 'No encontré el objeto `' + selected + '`.', ephemeral: true });

        module.exports.run(interaction, db, { amount: amount, item: item, craft: craft });
    },

    run: async (message, db, data = { amount, item, craft }) => {
        message = fix(message);

        if (!data.item.use?.type) return message.reply({ content: 'Este objeto no se puede usar.', ephemeral: true });

        var path = 'cash';
        let rewardText;
        const current = await db.get(`e_${message.guildId}_${message.user.id}.inv.objects._${data.item.id}`) || 0;
        if (current <= 0) return message.reply({ content: `Parece que no tienes ${data.item.name}`, ephemeral: true });
        if (current < data.amount) return message.reply({ content: `Te falta x${data.amount - current} ${data.item.name}.`, ephemeral: true });

        const convertion = await db.get(`g_${message.guildId}.convertion`);

        // add more
        switch (data.item.use.type) {
            case 'cash': 
                rewardText = `${convertion.emoji} ${data.amount * data.item.use.amount} ${convertion.name}`;
                break;

            default: return;
        }

        await db.sub(`e_${message.guildId}_${message.user.id}.inv.objects._${data.item.id}`, data.amount);
        await db.add(`e_${message.guildId}_${message.user.id}.${path}`, data.amount * data.item.use.amount);

        var embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL() })
            .setColor(0x0099FF)
            .setDescription(data.craft.txt.use.replace('{reward}', rewardText))
            .setTimestamp();

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}