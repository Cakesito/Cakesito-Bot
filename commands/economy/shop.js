const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Mira la tienda'),

    runPrefix: (client, message) => module.exports.run(message, client.db),
    
    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);
    
        const shop = await db.get(`g_${message.guildId}.shop.items`);
        if(!shop.length) return message.reply({ content: 'No hay tienda en este servidor.', ephemeral: true });
    
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        const items = await db.get(`g_${message.guildId}.craft.items`);
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Objetos creables` })
        .addFields()
        .setColor(0x0099FF)
    
        shop.forEach(item => {
            let price;
            if (item.price.type === 'inv.') price = `x${item.price.amount} **${items.find(x => x.id === item.ref_id)?.name}**`;
            if (item.price.type === 'cash') price = `${convertion.emoji} ${item.price.amount} ${convertion.name}`;
            if (!price) return;
    
            return embed.addFields({ 
                name: `${item.name} · ${price}`,
                value: `${item.description ?? '_Este objeto no tiene descripción_'}${item.onlyOnce ? '\n_Este item solo se puede comprar una vez_' : '' }` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}