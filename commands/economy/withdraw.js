const { EmbedBuilder } = require("discord.js");

module.exports = {
    aliases: ['with'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        
        let current = await db.get(`e_${message.author.id}.bank`) || 0;
        // if(!current) return message.channel.send('xd');

        let amount = args[0];
        if(!amount || isNaN(Number(amount)) && amount != 'all') return message.channel.send('xd');
        
        if(amount == 'all' || amount == 'max') amount = current;
        if(current == 0 || amount > current) return message.channel.send(`Parece que no tienes dinero suficiente.\nFaltante: ${amount - current}`);

        amount = Number(amount);

        await db.add(`e_${message.author.id}.cash`, amount);
        await db.sub(`e_${message.author.id}.bank`, amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Retirado <:star:991110840780599336> ${amount} de tu banco!`)
        .setTimestamp();
        
        return message.reply({ embeds: [embed]});
    }
}