const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } = require("discord.js");

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
        const available = ['claim', 'craft', 'crime', 'daily', 'explore', 'work'];
        let selection = interaction.options.getString('comando');
        
        if (!available.includes(selection)) return message.reply({ content: 'El comando `' + selection + '` no existe o no se puede deshabilitar.', ephemeral: true });

        let status = await db.get(`n_${interaction.guildId}_${command.name}`) || false
        let newStatus = status == true ? false : true;

        await db.set(`n_${interaction.guildId}_${command.name}`, newStatus);

        return interaction.reply('`' + command.name + '`:' + ` ${newStatus == true ? 'desactivado' : 'activado'}`);
    }
}
