const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-prefix')
    .setDescription('Elige un nuevo prefix')
    .setDescriptionLocalizations({
        "en-GB": "Choose a new prefix",
        "en-US": "Choose a new prefix"
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(option => 
        option.setRequired(true)
        .setName('prefix')
        .setDescription('El nuevo prefix')
        .setDescriptionLocalizations({
            "en-GB": "The new prefix",
            "en-US": "The new prefix"
        })
    ),

    runPrefix: (client, comments, message, args) => {
        var prefix = args[0];
        if (!prefix) return message.reply(comments.admin["set-prefix"].invalidPrefix);

        module.exports.run(message, comments, client.db, { prefix });
    },

    runSlash: (client, comments, interaction) => {
        var prefix = interaction.options.getString('prefix');
        if (!prefix) return interaction.reply({ content: comments.admin["set-prefix"].invalidPrefix, ephemeral: true });

        module.exports.run(interaction, comments, client.db, { prefix });
    },

    run: async (message, comments, db, { prefix }) => {
        message = fix(message);
    
        await db.set(`g_${message.guildId}.prefix`, prefix);
        return message.reply({ content: comments.admin["set-prefix"].mainResponse.replace('{prefix}', prefix) });
    }
}