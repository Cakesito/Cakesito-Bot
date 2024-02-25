const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

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

    run: async (client, interaction) => {
        const db = client.db.get('db');

        let prefix = interaction.getString('prefix');
        if (!prefix) return interaction.reply({ content: '¿Cuál es el nuevo prefix?', ephemeral: true });

        await db.set(`g_${interaction.guildId}.prefix`, prefix);
        return interaction.reply('Mi nuevo prefix en este servidor es: `' + prefix + '`');
    }
}