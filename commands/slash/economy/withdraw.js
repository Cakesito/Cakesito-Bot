const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Retira dinero de tu banco')
    .addStringOption(x =>
        x.setName('cantidad')
        .setDescription('Cantidad a retirar o all/max')),
        
    run: async (client, interaction) => {
        const db = client.db.get('db');

        let current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.bank`) || 0;
        let amount = interaction.options.getString('cantidad') || current;
        
        if(amount == 'all' || amount == 'max') amount = current;
        
        if (isNaN(Number(amount))) interaction.reply({ content: 'Cantidad inválida', ephemeral: true });
        if(current <= 0 || amount > current) return interaction.reply({ content: `Parece que no tienes dinero suficiente.\nFaltante: ${amount - current}`, ephemeral: true});

        await db.add(`e_${interaction.guildId}_${interaction.user.id}.cash`, amount);
        await db.sub(`e_${interaction.guildId}_${interaction.user.id}.bank`, amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.member.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Depositado <:star:991110840780599336> ${amount} a tu banco!`)
        .setTimestamp();

        return interaction.reply({ embeds: [embed]});
    }
}