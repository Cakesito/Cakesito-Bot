const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('money')
    .setDescription('Añade/resta dinero a un usuario')
    .setDescriptionLocalizations({
        "en-GB": "Add/subtract money from an user",
        "en-US": "Add/subtract money from an user"
    })

    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addUserOption(x =>
        x.setRequired(true)
        .setName('usuario')
        .setDescription('Usuario a añadir/restar dinero')
        .setDescriptionLocalizations({
            "en-GB": "User to add/subtract money",
            "en-US": "User to add/subtract money"
        })
    )
    .addIntegerOption(x =>
        x.setRequired(true)
        .setName('cantidad')
        .setDescription('Cantidad de dinero (puede ser negativo)')
        .setDescriptionLocalizations({
            "en-GB": "Amount (it can be negative)",
            "en-US": "Amount (it can be negative)"
        })
    )
    .addStringOption(x => 
        x.setName('destino')
        .setDescription('El dinero debería ir al banco o en mano (por defecto)')
        .setDescriptionLocalizations({
            "en-GB": "Where should the money go? bank or cash (by default)",
            "en-US": "Where should the money go? bank or cash (by default)"
        })
        .addChoices(
            { name: 'bank', value: 'bank'},
            { name: 'cash', value: 'cash' }
        )
    ),

    runPrefix: async (client, comments, message, args) => {
        if (!args[0]) return message.reply(comments.admin.money.noUser);

        const member = await require('../util/selectMember')(message, args, 1);
        if (member.bot) return message.reply(comments.botSelected);
        if (!member.found) return message.reply(comments.userNotFound);

        let amount = args[1];
        let type = args[2] || 'cash';

        if (!Number(amount)) return message.reply(comments.admin.money.invalidAmount);
        amount = Number(amount);

        if (type != 'cash' && type != 'bank') return message.reply(comments.admin.money.invalidDestination);

        module.exports.run(message, comments, client.db, { member: member.member, type, amount });
        
    },

    runSlash: (client, comments, interaction) => {
        let amount = interaction.options.getInteger('cantidad');
        let member = interaction.options.getMember('usuario') || interaction.member;
        let type = interaction.options.getString('destino') || 'cash';

        if (member.user.bot) return interaction.reply({ content: comments.admin.money.botSelected, ephemeral: true });

        module.exports.run(interaction, comments, client.db, { member, type, amount });
    },

    run: async (message, comments, db, { member, type, amount } ) => {
        message = fix(message);
    
        await db.add(`e_${member.guild.id}_${member.user.id}.${type}`, amount);
    
        let embed = new EmbedBuilder()
        .setDescription(comments.admin.money.mainResponse
            .replace('{amount}', amount)
            .replace('{user}', member.displayName, member.user.username)
            .replace('{type}', type))
        .setTimestamp()
        .setColor(0x0099FF);
    
        return message.reply({ embeds: [embed] });
    }
}