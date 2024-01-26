const Economy = require('../../things/economy');
const { explore } = require('../../economy.json');

module.exports = {
    cooldown: explore.cooldown || 0,
    tCooldown: explore.tCooldown || null,
    run: async (client, message) => {
        const db = client.db.get('db');
        let exploreCommand = new Economy().obj('Explore', explore, message.author);
        
        await db.add(`e_${member.guild.id}_${message.author.id}.inv.obj.${exploreCommand.obj.obj}`, exploreCommand.obj.amount);
        
        return message.reply({ embeds: [exploreCommand.embed], allowedMentions: { repliedUser: false } });

    }
}