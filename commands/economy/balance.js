const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['bal'],
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mira tu dinero o el de un usuario')
    .setDescriptionLocalizations({
        "en-GB": "View your balance or an user's balance",
        "en-US": "View your balance or an user's balance"
    })
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el dinero de un usuario')
        .setDescriptionLocalizations({
            "en-GB": "View an user's balance",
            "en-US": "View an user's balance"
        })
    ),

    runPrefix: async (client, comments, message, args) => {
        const member = await require('../util/selectMember')(message, args);
        if (member.bot) return message.reply(comments.botSelected);
        if (!member.found) return message.reply(comments.userNotFound);
    
        module.exports.run(message, comments, client.db, { member: member.member });
    },

    runSlash: (client, comments, interaction) => {
        var member = interaction.options.getMember('usuario') || interaction.member;
        if (member.user.bot) return interaction.reply({ content: comments.botSelected, ephemeral: true });

        module.exports.run(interaction, comments, client.db, { member });
    },

    run: async (message, comments, db, { member }) => {
        message = fix(message);
    
        let bal = await db.get(`e_${message.guildId}_${member.user.id}`);
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        if (!bal) bal = { cash: 0, bank: 0 };
    
        bal.cash = bal.cash ? bal.cash : 0;
        bal.bank = bal.bank ? bal.bank : 0;
    
        let balEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.displayAvatarURL() })
        .addFields(
            { name: 'Cash', value: `${convertion.emoji ?? ''} ${bal.cash} ${convertion.name}`, inline: true },
            { name: 'Bank', value: `${convertion.emoji ?? ''} ${bal.bank} ${convertion.name}`, inline: true },
            { name: 'Total', value: `${convertion.emoji ?? ''} ${bal.cash + bal.bank} ${convertion.name}`, inline: true }
        )
        .setTimestamp();
    
        return message.reply({ embeds: [balEmbed], allowedMentions: { repliedUser: false } });
    }
}