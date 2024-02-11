const { EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');

let options = new SlashCommandStringOption()
.setName('objeto')
.setDescription('Nombre del objeto a crear')
.setRequired(true);

// craft.items.forEach(x => options.addChoices({ name: x.name, value: x.name }));

module.exports = {
    deactivated: true,
    data: new SlashCommandBuilder()
    .setName('craft')
    .setDescription('Crea algo')
    .addStringOption(options)
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a crear')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const craft = await db.get(`g_${interaction.guildId}.craft`);
        if (!craft.items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true });

        var selected = interaction.options.getString('objeto');
        let item = craft.items.find(x => x.name == selected);
        let amount = interaction.options.getInteger('cantidad') || 1;

        inv = await db.get(`e_${interaction.guildId}_${interaction.user.id}.inv`) || {};
        current = {};
        Object.entries(inv).forEach(x => current[x[0]] = x[1]);

        Math.floor(Math.random() * 100) <= item.probability ? n = 'success' : n = 'fail';

        var missing = [];

        // Quick.db doesn't work in forEach
        for (x of Object.keys(item.materials)) {
            if ((item.materials[x] * amount) > current[x]) {
                missing.push(`x${(item.materials[x] * amount) - current[x]} **${x}** (${current[x]}/${item.materials[x] * amount})`);
            }
        }
        
        if(missing.length) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no tienes los __recursos suficientes__.\n\n**Faltante:**\n${missing.join('\n')}`)
            .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        for (x of Object.keys(item.materials)) {
            await db.sub(`e_${interaction.guild.id}_${interaction.user.id}.inv.${x}`, item.materials[x] * amount);
        }

        await db.add(`e_${interaction.guildId}_${interaction.user.id}.${item.type}`, amount);
        
        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setColor(n == 'success' ? 0x56bb74 : 0xec5454)
        .setDescription(craft.txt[n].replace('{item}', item.name))
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}

