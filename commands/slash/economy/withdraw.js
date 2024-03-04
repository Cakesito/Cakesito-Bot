const { SlashCommandBuilder } = require("discord.js");
const withdraw = require('../../../base_commands/withdraw');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Retira dinero de tu banco')
    .addStringOption(x =>
        x.setName('cantidad')
        .setDescription('Cantidad a retirar o all/max (por defecto)')),
        
    run: async (client, interaction) => {
        const db = client.db.get('db');

        let current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.bank`) || 0;
        let amount = interaction.options.getString('cantidad') || current;
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        
        if(amount == 'all' || amount == 'max') amount = current;
        
        if (isNaN(Number(amount))) interaction.reply({ content: 'Cantidad inválida', ephemeral: true });
        if(current <= 0 || amount > current) return interaction.reply({ content: `Parece que no tienes suficiente.\nFaltante: ${amount - current} ${convertion.cash}`, ephemeral: true});

        withdraw(interaction, db, { amount: amount });
    }
}