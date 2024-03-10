const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('craft-list')
    .setDescription('Mira la lista de objetos creables'),

    runPrefix: (client, message) => module.exports.run(message, client.db),

    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);
        
        const items = await db.get(`g_${message.guildId}.craft.items`);
        if(!items.length) return message.reply({ content: 'No hay objetos que crear.', ephemeral: true });
        const materials = await db.get(`g_${message.guildId}.materials`);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Objetos creables` })
        .setColor(0x0099FF)
    
        items.forEach(item => {
            return embed.addFields({ 
                name: item.name,
                value: `${item.description ?? '_Este objeto no tiene descripción_'}\n${item.materials.map(x => `x${x.amount} **${materials.find(k => k.id === x.ref_id)?.name}**`).join(', ')}` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}