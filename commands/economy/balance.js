const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['bal'],
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mira tu dinero o el de un usuario')
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el dinero de un usuario')
    ),

    runPrefix: async (client, message, args) => {
        const member = await require('../util/selectMember')(message, args);
        if (member === 'cancel') return;
        if (!member) return message.reply('No pude encontrar el usuario.');

        module.exports.run(message, client.db, { member: member });
    },

    runSlash: (client, interaction) => {
        var member = interaction.options.getMember('usuario') || interaction.member;
        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        module.exports.run(interaction, client.db, { member: member });
    },

    run: async (message, db, data = { member }) => {

        message = fix(message);
    
        let bal = await db.get(`e_${message.guildId}_${data.member.user.id}`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        if (!bal) bal = { cash: 0, bank: 0 };
    
        bal.cash = bal.cash ? bal.cash : 0;
        bal.bank = bal.bank ? bal.bank : 0;
    
        let balEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: data.member.user.displayName || data.member.user.username, iconURL: data.member.displayAvatarURL() })
        .addFields(
            { name: 'Cash', value: `${convertion.emoji ?? ''} ${bal.cash} ${convertion.name}`, inline: true },
            { name: 'Bank', value: `${convertion.emoji ?? ''} ${bal.bank} ${convertion.name}`, inline: true },
            { name: 'Total', value: `${convertion.emoji ?? ''} ${bal.cash + bal.bank} ${convertion.name}`, inline: true }
        )
        .setTimestamp();
    
        return message.reply({ embeds: [balEmbed], allowedMentions: { repliedUser: false } });
    }
}