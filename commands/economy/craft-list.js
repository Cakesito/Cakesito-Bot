const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('craft-list')
    .setDescription('Mira la lista de objetos creables')
    .setDescriptionLocalizations({
        "en-GB": "View the server's craft list",
        "en-US": "View the server's craft list"
    }),

    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db),

    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments, client.db),

    run: async (message, comments, db) => {
        message = fix(message);
        
        const items = await db.get(`g_${message.guildId}.craft.items`);
        if(!items.length) return message.reply({ content: comments.economy['craft-list'].noObjects, ephemeral: true });
        const materials = await db.get(`g_${message.guildId}.materials`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} ${comments.economy['craft-list'].embedAuthor}` })
        .setColor(0x0099FF)
    
        items.forEach(item => {
            return embed.addFields({ 
                name: item.name,
                value: `${item.description ?? comments.missingObjectDescription}\n${item.materials.map(x => `x${x.amount} **${materials.find(k => k.id === x.ref_id)?.name}**`).join(', ')}` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}