const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mira tu dinero o el de un usuario')
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el dinero de un usuario')),

    run: async (client, interaction) => {

        const db = client.db.get('db');
        let member = interaction.options.getMember('usuario') || interaction.member;
        
        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });
        
        let bal = await db.get(`e_${member.guild.id}_${member.user.id}`);
        if (!bal) bal = { cash: 0, bank: 0 };

        const convertion = await db.get(`g_${interaction.guildId}.convertion`);

        bal.cash = bal.cash ? bal.cash : 0;
        bal.bank = bal.bank ? bal.bank : 0;

        let balEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .addFields(
            { name: 'Cash', value: `${bal.cash} ${convertion.cash}`, inline: true },
            { name: 'Bank', value: `${bal.bank} ${convertion.cash}`, inline: true },
            { name: 'Total', value: `${bal.cash + bal.bank} ${convertion.cash}`, inline: true }
        )
        .setTimestamp();

        return interaction.reply({ embeds: [balEmbed] });
        
    }
}