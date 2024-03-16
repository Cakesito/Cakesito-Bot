const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['with'],
    data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Retira dinero de tu banco')
    .addStringOption(x =>
        x.setName('cantidad')
        .setDescription('Cantidad a retirar o all/max (por defecto)')
    ),

    runPrefix: (client, message, args) => module.exports.run(message, client.db, { amount: args[0] }),

    runSlash: async (client, interaction) => {
        const db = client.db;
        const current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.bank`) || 0;

        let amount = interaction.options.getString('cantidad') || current;
        module.exports.run(interaction, db, { amount: amount });
    },

    run: async (message, db, data = { amount }) => {
        message = fix(message);

        if (Number(data.amount) && data.amount < 0) return message.reply({ content: '¿Cuánto?...', ephemeral: true });
        const convertion = await db.get(`g_${message.guildId}.convertion`)
        const current = await db.get(`e_${message.guildId}_${message.user.id}.bank`) || 0;

        if (current === 0) return message.reply({ content: 'Parece que no tienes dinero...', ephemeral: true });

        if (!data.amount) return message.reply({ content: '¿Cuánto?', ephemeral: true });
        if (data.amount == 'all' || data.amount == 'max') data.amount = current;
        
        if (isNaN(Number(data.amount))) return message.reply({ content: 'Cantidad inválida', ephemeral: true });
        
        if (current <= 0) return message.reply({ content: `Parece que no tienes dinero suficiente.\nFaltante: ${convertion.emoji} ${current * -1} ${convertion.name}`, ephemeral: true});
        if(Number(data.amount) > current) return message.reply({ content: `Parece que no tienes dinero suficiente.\nFaltante: ${convertion.emoji} ${data.amount - current} ${convertion.name}`, ephemeral: true});
    
        await db.sub(`e_${message.guild.id}_${message.userId}.bank`, data.amount);
        await db.add(`e_${message.guild.id}_${message.userId}.cash`, data.amount);
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Has retirado ${convertion.emoji} ${data.amount} ${convertion.name} del banco!`)
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}