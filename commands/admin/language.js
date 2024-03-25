const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fix = require('../util/fix');

const availableLangs = ['es', 'en'];

module.exports = {
    aliases: ["lang"],
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Selecciona un nuevo idioma')
        .setDescriptionLocalizations({
            "en-GB": "Choose a new language",
            "en-US": "Choose a new language"
        })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addStringOption(option => 
            option.setName('language')
            .setDescription('El nuevo idioma')
            .setDescriptionLocalizations({
                "en-GB": "The new language",
                "en-US": "The new language"
            })
            .setRequired(true)
            .addChoices(
                { name: 'Español', value: 'es' },
                { name: 'English', value: 'en' }
            )
        ),

    runPrefix: (client, comments, message, args) => module.exports.run(message, comments, client.db, { lang: args[0], client: client }),
    
    runSlash: (client, comments, interaction) => module.exports.run(interaction, comments, client.db, { lang: interaction.options.getString('language'), client: client }),

    run: async (message, comments, db, { lang, client }) => {
        comments = comments.admin.language;
        message = fix(message);
        
        if (availableLangs.includes(lang)) {
            await db.set(`g_${message.guildId}.lang`, lang);
            return message.reply({ content: client.languages.get(lang).admin.language.mainResponse.available });
        }

        return message.reply({ content: comments.mainResponse.notAvailable.replace('{available}', availableLangs.join('`, `')), allowedMentions: { repliedUser: false }, ephemeral: true });
    }
}