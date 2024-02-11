const { EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');

let options = new SlashCommandStringOption()
.setName('objeto')
.setDescription('Nombre del objeto')
.setRequired(true);

// shop.items.forEach(x => options.addChoices({ name: x.name, value: x.name }));

module.exports = {
    deactivated: true,
    data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra algo en la tienda')
    .addStringOption(options)
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a comprar')),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        const shop = await db.get(`g_${interaction.guildId}.shop`);
        if (!shop.items.length) return interaction.reply({ content: 'Este comando no está disponible en este servidor.', ephemeral: true});

        const convertion = await db.get(`g_${interaction.guildId}.convertion`);

        let item = shop.items.filter(x => x.name == interaction.options.getString('objeto'));
        item = item[0];
        let amount = interaction.options.getInteger('cantidad') || 1;

        var hasBought = await db.get(`e_${interaction.guildId}_${interaction.user.id}.alreadyBought`) || [];

        if (item.onlyOnce && hasBought.includes(item.name)) return interaction.reply({ content: 'Ya has comprado este objeto.', ephemeral: true });
        if (amount > 1 && item.reward.type == 'role') return interaction.reply({ content: 'Solo puedes comprar uno.', ephemeral: true });

        item.reward.amount = item.reward.amount * amount;
        item.price.amount = item.price.amount * amount;

        current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.${item.price.type}`) || 0;
        
        if (current < item.price.amount) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: interaction.member.displayName || interaction.user.tag, iconURL: interaction.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no lo puedes comprar.\nFaltante: x${item.price.amount - current} ${convertion[item.price.type] || item.price.type.replace('inv.', '')}`)
            .setTimestamp()
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let text = `x${item.reward.amount || 1} ${convertion[item.reward.type] || item.price.type.replace('inv.', '')}`;

        if (item.reward.type == 'role') {
            let role = await interaction.guild.roles.cache.find(x => x.id == item.reward.id);
            if (!role) return interaction.reply('Rol no encontrado.');

            interaction.member.roles.add(role);
            text = `<@&${item.reward.id}>`;

        } else await db.add(`e_${interaction.guildId}_${interaction.user.id}.${item.reward.type}`, item.reward.amount);

        await db.sub(`e_${interaction.guildId}_${interaction.user.id}.${item.price.type}`, item.price.amount);
        if (item.onlyOnce) await db.push(`e_${interaction.guildId}_${interaction.user.id}.alreadyBought`, item.name);

        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(shop.txt.replace('{reward}', text))
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}