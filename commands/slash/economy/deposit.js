const { SlashCommandBuilder } = require("discord.js");
const deposit = require('../../../base_commands/deposit');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposita dinero a tu banco')
    .addStringOption(x => x.setName('cantidad').setDescription('Cantidad a depositar o all/max (por defecto)')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const convertion = await db.get(`g_${interaction.guildId}.convertion`)
        
        let current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.cash`) || 0;

        let amount = interaction.options.getString('cantidad') || current;
        
        if(amount == 'all' || amount == 'max') amount = current;
        
        if (isNaN(Number(amount))) interaction.reply({ content: 'Cantidad inválida', ephemeral: true });
        if(current <= 0 || amount > current) return interaction.reply({ content: `Parece que no tienes dinero suficiente.\nFaltante: ${convertion.emoji} ${amount - current} ${convertion.name}`, ephemeral: true});

        deposit(interaction, db, { amount: amount });
    }
}