const { EmbedBuilder } = require("discord.js");

module.exports = {
    aliases: ['dep'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        
        let current = await db.get(`e_${message.author.id}.cash`) || 0;
        // if(!current) return message.reply('xd');

        let amount = args[0];
        if(!amount || isNaN(Number(amount)) && amount != 'all') return message.reply('xd');
        
        if(amount == 'all' || amount == 'max') amount = current;
        if(current = 0 || amount > current) return message.reply(`Parece que no tienes dinero suficiente.\nFaltante: ${amount - current}`);
        
        amount = Number(amount);

        await db.add(`e_${message.author.id}.bank`, amount);
        await db.sub(`e_${message.author.id}.cash`, amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Depositado <:star:991110840780599336> ${amount} a tu banco!`)
        .setTimestamp();

        return message.reply({ embeds: [embed]});
    }
}