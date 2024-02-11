module.exports = {
    run: async (client, interaction) => {

        const db = client.db.get('db');

        if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) return;
        if (!interaction.guild) return;
        
        // await interaction.deferReply().catch(err => {});

        if (interaction.isChatInputCommand()) {
            let command = client.slash_commands.get(interaction.commandName);
            if (!command) return;
    
            if(await db.get(`n_${interaction.guildId}_${command.data.name}`)) return interaction.reply({ content: 'Este comando está deshabilitado en este servidor.', ephemeral: true });
            
            if(command.requiresCooldown) {
                let cooldown = await db.get(`g_${interaction.guildId}.${command.data.name}.cooldown`);
                let timeout = client.cooldowns.get(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`) || 0;
    
                if(timeout + cooldown > Date.now()) return interaction.reply({ content: `Espera hasta <t:${Math.floor((timeout + cooldown) / 1000)}:t> (<t:${Math.floor((cooldown + timeout) / 1000)}:R>) para usar ${interaction.commandName}.`, ephemeral: true });
                client.cooldowns.set(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`, Date.now());
            }
            
            command.run(client, interaction);
        }
        
        if (interaction.isUserContextMenuCommand()) {
            let command = client.menu_commands.get(interaction.commandName);
            if (!command) return;

            command.run(client, interaction);
        }

    }
}