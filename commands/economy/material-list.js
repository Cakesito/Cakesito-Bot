const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['mat-list'],
    data: new SlashCommandBuilder()
        .setName('material-list')
        .setDescription('Mira la lista de materiales')
        .setDescriptionLocalizations({
            "en-GB": "View the server's material list",
            "en-US": "View the server's material list"
        }),

    runPrefix: (client, comments, message) => module.exports.run(message, comments, client.db),

    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments, client.db),

    run: async (message, comments, db) => {
        message = fix(message);

        const materials = await db.get(`g_${message.guildId}.materials`);
        if(!materials.length) return message.reply({ content: comments.economy['material-list'].noMaterials, ephemeral: true });
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} ${comments.economy['material-list'].embedAuthor}` })
        .setColor(0x0099FF)
    
        materials.forEach(mat => {
            return embed.addFields({ 
                name: mat.name,
                value: `${(!mat.description || mat.description === '') ? comments.missingMaterialDescription : mat.description}` 
            });
        });
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}