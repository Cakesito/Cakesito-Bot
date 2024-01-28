module.exports = {
    run: async (client, interaction) => {

        const db = client.db.get('db');

        if (!interaction.isChatInputCommand()) return;
        if (!interaction.guild) return;
        
        // await interaction.deferReply().catch(err => {});

        let command = client.slash_commands.get(interaction.commandName);
        if (!command) return;

        if(await db.get(`n_${interaction.guildId}_${command.data.name}`)) return interaction.reply({ content: 'Este comando está deshabilitado en este servidor.', ephemeral: true });

        if(command.cooldown) {
            let timeout = client.cooldowns.get(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`) || 0;

            if(timeout + command.cooldown > Date.now()) return interaction.reply({ content: `Espera hasta <t:${Math.floor((timeout + command.cooldown) / 1000)}:t> (<t:${Math.floor((command.cooldown + timeout) / 1000)}:R>) para usar ${interaction.commandName}.`, ephemeral: true });
            client.cooldowns.set(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`, Date.now());
        }

        try {
            await command.run(client, interaction);
        } catch (err) {
            console.log(err);
            return interaction.followUp({ content: 'Ocurrió un error', ephemeral: true });
        }
    }
}