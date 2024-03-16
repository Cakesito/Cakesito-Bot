const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fix = require('../util/fix');

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
        )
    ),

    runPrefix: async (client, message, args) => {

        const member = await require('../util/selectMember')(message, args, 1);
        if (member.bot) return message.reply('El usuario elegido es un bot.');
        if (!member.found) return message.reply('No pude encontrar el usuario.');

        let amount = args[1];
        let type = args[2] || 'cash';

        if (!Number(amount)) return message.reply('Señala una cantidad válida (puede ser negativa).');
        amount = Number(amount);

        if (type != 'cash' && type != 'bank') return message.reply('Señala una ubicación válida para el dinero (cash/bank).');

        module.exports.run(message, client.db, { member: member.member, type: type, amount: amount });
        
    },

    runSlash: (client, interaction) => {
        let amount = interaction.options.getInteger('cantidad');
        let member = interaction.options.getMember('usuario') || interaction.member;
        let type = interaction.options.getString('destino') || 'cash';

        if (member.user.bot) return interaction.reply({ content: 'El usuario seleccionado es un bot', ephemeral: true });

        module.exports.run(interaction, client.db, { member: member, type: type, amount: amount });
    },

    run: async (message, db, data = { member, type, amount } ) => {
        message = fix(message);
    
        await db.add(`e_${data.member.guild.id}_${data.member.user.id}.${data.type}`, data.amount);
    
        let embed = new EmbedBuilder()
        .setDescription(`${data.amount} a ${data.member.displayName || data.member.user.username} (${data.type})`)
        .setTimestamp()
        .setColor(0x0099FF);
    
        return message.reply({ embeds: [embed] });
    }
}