module.exports = {
    run: async (client, interaction) => {

        const db = client.db;

        if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) return;
        if (!interaction.guild) return;
        
        // await interaction.deferReply().catch(err => {});

        let comments = await db.get(`g_${interaction.guildId}.lang`) || 'es';
        comments = client.languages.get(comments);

        let command;
        if (interaction.isChatInputCommand()) {
            command = client.commands.get(interaction.commandName);
            if (!command) return;
    
            if(await db.get(`n_${interaction.guildId}_${interaction.commandName}`)) return interaction.reply({ content: comments.commandNotActive, ephemeral: true });
            
            if(command.requiresCooldown) {
                let cooldown = await db.get(`g_${interaction.guildId}.${command.data.name}.cooldown`);
                let timeout = client.cooldowns.get(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`) || 0;
                let time = Math.floor((timeout + cooldown) / 1000);

                if(timeout + cooldown > Date.now()) return interaction.reply({ content: comments.cooldown.replace(/\{time\}/g, time).replace('{command}', interaction.commandName), ephemeral: true });
                client.cooldowns.set(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`, Date.now());
            }
            
        }
        
        if (interaction.isUserContextMenuCommand()) {
            command = client.menu_commands.get(interaction.commandName);
            if (!command) return;
        }

        try {
            command.runSlash(client, comments, interaction);
        } catch (err) {
            interaction.reply({ content: comments.error, ephemeral: true });
            console.error(err);
        }

    }
}