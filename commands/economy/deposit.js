const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['dep'],
    data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposita dinero a tu banco')
    .addStringOption(x => x.setName('cantidad').setDescription('Cantidad a depositar o all/max (por defecto)')),

    runPrefix: (client, message, args) => module.exports.run(message, client.db, { amount: args[0] }),

    runSlash: async (client, interaction) => {
        const db = client.db;
        const current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.cash`) || 0;

        let amount = interaction.options.getString('cantidad') || current;
        module.exports.run(interaction, db, { amount: amount });
    },

    run: async (message, db, data = { amount }) => {
        message = fix(message);

        const convertion = await db.get(`g_${interaction.guildId}.convertion`)
        const current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.cash`) || 0;

        if (!data.amount) return message.reply({ content: '¿Cuánto?', ephemeral: true });
        if (!Number(data.amount) && (data.amount !== 'all' || data.amount !== 'max')) return message.reply({ content: 'Cantidad inválida', ephemeral: true });

        if (data.amount === 'all' || data.amount === 'max') data.amount = current;
        
        if(current <= 0 || Number(data.amount) > current) return interaction.reply({ content: `Parece que no tienes dinero suficiente.\nFaltante: ${convertion.emoji} ${amount - current} ${convertion.name}`, ephemeral: true});
        
        await db.add(`e_${message.guild.id}_${message.userId}.bank`, data.amount);
        await db.sub(`e_${message.guild.id}_${message.userId}.cash`, data.amount);
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Has depositado ${convertion.emoji} ${data.amount} ${convertion.name} a tu banco!`)
        .setTimestamp();
    
        return message.reply({ embeds: [embed]});
    }
}