const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } = require("discord.js");
const toggle = require('../../../base_commands/toggle');

let options = new SlashCommandStringOption()
.setRequired(true)
.setName('comando')
.setDescription('Comando a activar/desactivar')
.addChoices(
    { name: 'work', value: 'work' },
    { name: 'crime', value: 'crime' },
    { name: 'daily', value: 'daily' },
    { name: 'claim', value: 'claim' },
    { name: 'craft', value: 'craft' },
    { name: 'explore', value: 'explore' }
);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Activa o desactiva un comando')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(options),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        let selection = interaction.options.getString('comando');
        if (!selection) return interaction.reply({ content: '¿Qué comando?', ephemeral: true });
        
        toggle(interaction, db, { command: selection });
    }
}
