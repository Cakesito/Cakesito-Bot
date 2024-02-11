const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const balance = require('../../slash/economy/balance');

module.exports = {
    name: 'Ver dinero',
    data: new ContextMenuCommandBuilder()
    .setName('Ver dinero')
    .setType(ApplicationCommandType.User),

    run: async (client, interaction) => {
        let user = interaction.guild.members.cache.find(x => x.id == interaction.targetId) || await interaction.guild.members(interaction.targetId);
        interaction.member = user;
        balance.run(client, interaction);
    } 
}