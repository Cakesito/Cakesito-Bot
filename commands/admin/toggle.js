const { PermissionsBitField, SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const fix = require('../util/fix');

const options = new SlashCommandStringOption()
    .setRequired(true)
    .setName('comando')
    .setDescription('Comando a activar/desactivar')
    .setDescriptionLocalizations({
        "en-GB": "Command to be enabled/disabled",
        "en-US": "Command to be enabled/disabled"
    })
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
    .setDescriptionLocalizations({
        "en-GB": "Enable or disable a command",
        "en-US": "Enable or disable a command"
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(options),

    runPrefix: (client, comments, message, args) => {
        if (!args[0]) return message.reply(comments.admin.toggle.noCommand);

        module.exports.run(message, comments, client.db, { command: args[0] });
    },
    
    runSlash: (client, comments, interaction) => {
        var selection = interaction.options.getString('comando');
        if (!selection) return interaction.reply({ content: comments.admin.toggle.noCommand, ephemeral: true });

        module.exports.run(interaction, comments, client.db, { command: selection });
    },

    run: async (message, comments, db, { command }) => {
        comments = comments.admin.toggle;
        message = fix(message);
        
        const available = ['claim', 'craft', 'crime', 'daily', 'explore', 'work'];
    
        if (!available.includes(command)) return message.reply(comments.invalidCommand.replace('{command}', command));
        let status = await db.get(`n_${message.guild.id}_${command}`) || false;
        var newStatus = status === true ? false : true;
    
        await db.set(`n_${message.guild.id}_${command}`, newStatus);
    
        return message.reply({ content: comments.mainResponse
            .replace('{command}', command)
            .replace('{status}', newStatus === true ? 'off' : 'on') });

    }
}