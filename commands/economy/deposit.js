const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['dep'],
    data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposita dinero a tu banco')
    .setDescriptionLocalizations({
        "en-GB": "Deposit cash to your bank",
        "en-US": "Deposit cash to your bank"
    })
    .addStringOption(x => 
        x.setName('cantidad')
        .setDescription('Cantidad a depositar o all/max (por defecto)')
        .setDescriptionLocalizations({
            "en-GB": "Amount to deposit or all/max (by default)",
            "en-US": "Amount to deposit or all/max (by default)"
        })
    ),

    runPrefix: (client, comments, message, args) => module.exports.run(message, comments, client.db, { amount: args[0] }),

    runSlash: async (client, comments, interaction) => {
        let amount = interaction.options.getString('cantidad') || 'all';
        module.exports.run(interaction, comments, client.db, { amount });
    },

    run: async (message, comments, db, { amount }) => {
        message = fix(message);
        if (amount == 0) return message.reply({ content: comments.zeroAmount, ephemeral: true });
        
        comments = comments.economy.deposit;
        
        if (Number(amount) && amount < 0) return message.reply({ content: comments.invalidAmount, ephemeral: true });
        const convertion = await db.get(`g_${message.guildId}.convertion`)
        const current = await db.get(`e_${message.guildId}_${message.user.id}.cash`) || 0;
        
        if (current === 0) return message.reply({ content: comments.noMoney, ephemeral: true });

        if (!amount) return message.reply({ content: comments.invalidAmount, ephemeral: true });
        if (amount == 'all' || amount == 'max') amount = current;

        if (isNaN(Number(amount))) return message.reply({ content: comments.invalidAmount, ephemeral: true });
        
        if (current <= 0) return message.reply({ content: comments.negativeMoney.replace('{money}', `${convertion.emoji} ${current} ${convertion.name}`), ephemeral: true});
        if(Number(amount) > current) return message.reply({ content: comments.notEnoughMoney.replace('{missing}', `${convertion.emoji} ${current} ${convertion.name}`), ephemeral: true});
        
        await db.add(`e_${message.guild.id}_${message.userId}.bank`, amount);
        await db.sub(`e_${message.guild.id}_${message.userId}.cash`, amount);
    
        let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName || message.user.username, iconURL: message.member.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(comments.mainResponse.replace('{amount}', `${convertion.emoji} ${amount} ${convertion.name}`))
        .setTimestamp();
    
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}