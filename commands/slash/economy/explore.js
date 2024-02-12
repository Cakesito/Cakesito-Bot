const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    requiresCooldown: true,
    data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explora la zona'),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const explore = await db.get(`g_${interaction.guildId}.explore`);
        const materials = await db.get(`g_${interaction.guildId}.materials`);

        if (!Object.keys(explore.materials).length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true });

        let reward = {};
        var success = false;
        for (x of Object.entries(explore.materials)) {
            var amount = random(x[1][0], x[1][1]);
            if (amount == 0) continue;

            let material = materials.find(x => x.name === x[0]);
            if (material) {
                reward.material = x[0];
                reward.materialAmount = amount;
            } else {
                reward.object = x[0];
                reward.objectAmount = amount;
            }

            success = true;
            await db.add(`e_${message.guild.id}_${message.author.id}.inv.${x[0]}`, amount);
        }
        
        let randomText = success ? explore.txt.success[Math.floor(Math.random() * explore.txt.success.length)].replace('{objectName}', reward.object || '').replace('{objectAmount}', reward.objectAmount || '').replace('{materialName}', reward.material || '').replace('{materialAmount}', reward.materialAmount || '') : explore.txt.fail[Math.floor(Math.random() * explore.txt.fail.length)];
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setTimestamp()
        .setDescription(randomText)
        .setColor(success ? 0x56bb74 : 0xec5454);
                
        return interaction.reply({ embeds: [embed] });

    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}