const { PermissionsBitField, SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const fix = require('../util/fix');

const options = new SlashCommandStringOption()
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

    runPrefix: (client, message, args) => {
        if (!args[0]) return message.reply('¿Qué comando?');

        module.exports.run(message, client.db, { command: args[0] });
    },
    
    runSlash: (client, interaction) => {
        var selection = interaction.options.getString('comando');
        if (!selection) return interaction.reply({ content: '¿Qué comando?', ephemeral: true });

        module.exports.run(interaction, client.db, { command: selection });
    },

    run: async (message, db, data = { command }) => {
        message = fix(message);
        
        const available = ['claim', 'craft', 'crime', 'daily', 'explore', 'work'];
    
        if (!available.includes(data.command)) return message.reply('El comando `' + data.command+ '` no existe o no se puede deshabilitar.');
        let status = await db.get(`n_${message.guild.id}_${data.command}`) || false;
        var newStatus = status === true ? false : true;
    
        await db.set(`n_${message.guild.id}_${data.command}`, newStatus);
    
        return message.reply('`' + data.command + '`:' + ` ${newStatus == true ? 'desactivado' : 'activado'}`);
    }
}