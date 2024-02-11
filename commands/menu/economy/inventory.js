const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const inventory = require('../../slash/economy/inventory');

module.exports = {
    name: 'Ver inventario',
    data: new ContextMenuCommandBuilder()
    .setName('Ver inventario')
    .setType(ApplicationCommandType.User),

    run: async (client, interaction) => {
        let user = interaction.guild.members.cache.find(x => x.id == interaction.targetId) || await interaction.guild.members(interaction.targetId);
        interaction.member = user;
        inventory.run(client, interaction);
    } 
}