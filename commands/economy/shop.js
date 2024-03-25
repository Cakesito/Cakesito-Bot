const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Mira la tienda')
    .setDescriptionLocalizations({
        "en-GB": "View the server's shop",
        "en-US": "View the server's shop"
    }),

    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db),
    
    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments, client.db),

    run: async (message, comments, db) => {
        message = fix(message);
    
        const shop = await db.get(`g_${message.guildId}.shop.items`);
        if(!shop.length) return message.reply({ content: comments.economy.shop.noShop, ephemeral: true });
    
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        const items = await db.get(`g_${message.guildId}.craft.items`);
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Shop` })
        .addFields()
        .setColor(0x0099FF)
    
        shop.forEach(item => {
            let price;
            if (item.price.type === 'inv.') price = `x${item.price.amount} **${items.find(x => x.id === item.price.ref_id)?.name}**`;
            if (item.price.type === 'cash') price = `${convertion.emoji} ${item.price.amount} ${convertion.name}`;
            if (!price) return;
    
            return embed.addFields({ 
                name: `${item.name} · ${price}`,
                value: `${item.description ?? comments.missingObjectDescription}${item.onlyOnce ? `\n${comments.economy.shop.onlyOnce}` : '' }` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}