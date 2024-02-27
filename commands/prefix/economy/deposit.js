const { EmbedBuilder } = require("discord.js");

module.exports = {
    aliases: ['dep'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        const convertion = await db.get(`g_${message.guildId}.convertion`);
        
        let current = await db.get(`e_${message.guild.id}_${message.author.id}.cash`) || 0;

        let amount = Number(args[0]);
        if(!amount || isNaN(amount) && amount != 'all' ||isNaN(amount) && amount != 'max') return message.reply('¿Cuánto dinero depositarás?');
        
        if(amount == 'all' || amount == 'max') amount = current;
        if(current <= 0 || amount > current) return message.reply(`Parece que no tienes suficiente.\nFaltante: ${amount - current} ${convertion.cash}`);

        await db.add(`e_${message.guild.id}_${message.author.id}.bank`, amount);
        await db.sub(`e_${message.guild.id}_${message.author.id}.cash`, amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL()})
        .setColor(0x56bb74)
        .setDescription(`Depositado ${amount} ${convertion.cash} a tu banco!`)
        .setTimestamp();

        return message.reply({ embeds: [embed]});
    }
}