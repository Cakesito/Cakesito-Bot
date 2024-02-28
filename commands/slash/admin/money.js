const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('money')
    .setDescription('Añade/resta dinero a un usuario o a ti mismo')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addUserOption(x =>
        x.setRequired(true)
        .setName('usuario')
        .setDescription('Usuario a añadir/restar dinero'))
    .addIntegerOption(x => 
        x.setRequired(true)
        .setName('cantidad')
        .setDescription('Cantidad de dinero (puede ser negativo)'))
    .addStringOption(x => 
        x.setName('destino')
        .setDescription('El dinero debería ir al banco o en mano (por defecto)')
        .addChoices(
            { name: 'bank', value: 'bank'},
            { name: 'cash', value: 'cash' }
        )),

    run: async (client, interaction) => {
        const db = client.db.get('db');

        let amount = interaction.options.getInteger('cantidad');
        let member = interaction.options.getMember('usuario') || interaction.member;
        let type = interaction.options.getString('destino') || 'cash';

        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        await db.add(`e_${interaction.guildId}_${member.user.id}.${type}`, amount);

        let embed = new EmbedBuilder()
        .setDescription(`${amount} a ${member.user.tag} (${type})`)
        .setTimestamp()
        .setColor(0x0099FF);

        return interaction.reply({ embeds: [embed] });
        
    }
}