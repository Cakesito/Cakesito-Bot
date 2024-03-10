const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('Ver inventario')
    .setType(ApplicationCommandType.User),

    runSlash: async (client, interaction) => {
        let user = interaction.guild.members.cache.find(x => x.id == interaction.targetId) || await interaction.guild.members(interaction.targetId);
        interaction.member = user;
        
        const cmd = client.commands.get('inventory');
        cmd.runSlash(client, interaction);
    } 
}