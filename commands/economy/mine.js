const Economy = require('../../things/economy');
const { mine } = require('../../economy.json');

module.exports = {
    cooldown: mine.cooldown || 0,
    tCooldown: mine.tCooldown || null,
    run: async (client, message) => {
        const db = client.db.get('db');
        let exploreCommand = new Economy().obj('Explore', mine, message.author);
        
        await db.add(`e_${message.author.id}.inv.obj.${exploreCommand.obj.obj}`, exploreCommand.obj.amount);
        
        return message.reply({ embeds: [exploreCommand.embed], allowedMentions: { repliedUser: false } });

    }
}