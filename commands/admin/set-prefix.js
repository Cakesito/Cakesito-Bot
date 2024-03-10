const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-prefix')
    .setDescription('Elige un nuevo prefix')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(option => 
        option.setRequired(true)
        .setName('prefix')
        .setDescription('El nuevo prefix')
    ),

    runPrefix: (client, message, args) => {
        var prefix = args[0];
        if (!prefix) return message.reply('¿Cuál es el nuevo prefix?');

        module.exports.run(message, client.db, { prefix: prefix });
    },

    runSlash: (client, interaction) => {
        var prefix = interaction.getString('prefix');
        if (!prefix) return interaction.reply({ content: '¿Cuál es el nuevo prefix?', ephemeral: true });

        module.exports.run(interaction, client.db, { prefix: prefix });
    },

    run: async (message, db, data = { prefix }) => {
        message = fix(message);
    
        await db.set(`g_${message.guildId}.prefix`, data.prefix);
        return message.reply('Mi nuevo prefix en este servidor es: `' + data.prefix + '`');
    }
}