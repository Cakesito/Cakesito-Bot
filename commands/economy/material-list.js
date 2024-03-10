const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['mat-list'],
    data: new SlashCommandBuilder()
        .setName('material-list')
        .setDescription('Mira la lista de materiales'),

    runPrefix: (client, message) => module.exports.run(message, client.db),

    runSlash: (client, interaction) => module.exports.run(interaction, client.db),

    run: async (message, db) => {
        message = fix(message);

        const materials = await db.get(`g_${message.guildId}.materials`);
        if(!materials.length) return message.reply({ content: 'No hay materiales.', ephemeral: true });
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Materiales` })
        .setColor(0x0099FF)
    
        materials.forEach(mat => {
            return embed.addFields({ 
                name: mat.name,
                value: `${(!mat.description || mat.description === '') ? '_Este material no tiene descripción_' : mat.description}` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}