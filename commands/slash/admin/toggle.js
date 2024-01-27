const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } = require("discord.js");
const { readdirSync } = require('node:fs');

let options = new SlashCommandStringOption()
.setRequired(true)
.setName('comando')
.setDescription('Comando a activar/desactivar');


readdirSync("./commands/prefix").forEach(dir => {
    let commands = readdirSync(`./commands/prefix/${dir}/`).filter(file => file.endsWith('.js'));

    for (let file of commands) {
        let pull = require(`../../prefix/${dir}/${file}`);
        pull.name = pull.name || file.replace('.js', '');
        if (dir == 'owner' || pull.name == 'toggle') return;

        options.addChoices({ name: pull.name, value: pull.name });
    }

});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Activa o desactiva un comando')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(options),

    run: async (client, interaction) => {
        const db = client.db.get('db');
        let selection = interaction.options.getString('comando');
        let command = client.prefix_commands.get(selection);

        let status = await db.get(`n_${interaction.guildId}_${command.name}`) || false
        let newStatus = status == true ? false : true;

        await db.set(`n_${interaction.guildId}_${command.name}`, newStatus);

        return interaction.reply('`' + command.name + '`:' + ` ${newStatus == true ? 'Desactivado' : 'Activado'}`);
    }
}
