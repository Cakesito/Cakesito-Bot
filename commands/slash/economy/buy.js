const { EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const { shop, convertion } = require('../../../economy.json');

let options = new SlashCommandStringOption()
.setName('objeto')
.setDescription('Nombre del objeto')
.setRequired(true);

shop.items.forEach(x => options.addChoices({ name: x.name, value: x.name }))

module.exports = {
    data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra algo en la tienda')
    .addStringOption(options)
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a comprar')),

    run: async (client, interaction) => {
        const db = client.db.get('db');

        let item = shop.items.filter(x => x.name == interaction.options.getString('objeto'));
        let amount = interaction.options.getInteger('cantidad') || 1;

        if (amount > 1 && item.reward.type == 'role') return interaction.reply({ content: 'Solo puedes comprar uno.', ephemeral: true });

        item.reward.amount = item.reward.amount * amount;
        item.price.amount = item.price.amount * amount;

        current = await db.get(`e_${interaction.guildId}_${interaction.user.id}.${item.price.type}`) || 0;
        
        if (current < item.price.amount) {
            let embed = new EmbedBuilder()
            .setAuthor({ name: interaction.member.displayName || interaction.user.tag, iconURL: interaction.member.displayAvatarURL() })
            .setColor(0xec5454)
            .setDescription(`Parece que no lo puedes comprar.\nFaltante: x${item.price.amount - current} ${convertion[item.price.type]}`)
            .setTimestamp()
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let text = `x${item.reward.amount || 1} ${convertion[item.reward.type]}`;

        if (item.reward.type == 'role') {
            let role = await interaction.guild.roles.cache.find(x => x.id == item.reward.id);
            if (!role) return interaction.reply('Rol no encontrado.');

            if (interaction.member.roles.cache.has(role)) return interaction.reply({ content: 'Ya has comprado este objeto.', ephemeral: true });

            interaction.member.roles.add(role);
            text = `<&${item.reward.id}>`;

        } else await db.add(`e_${interaction.guildId}_${interaction.user.id}.${item.reward.type}`, item.reward.amount);

        await db.sub(`e_${interaction.guildId}_${interaction.user.id}.${item.price.type}`, item.price.amount);

        let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.member.displayName || interaction.user.username, iconURL: interaction.member.displayAvatarURL() })
        .setColor(0x56bb74)
        .setDescription(shop.txt.replace('{reward}', text))
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}