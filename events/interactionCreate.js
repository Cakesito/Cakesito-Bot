module.exports = {
    run: async (client, interaction) => {

        const db = client.db.get('db');

        if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) return;
        if (!interaction.guild) return;
        
        // await interaction.deferReply().catch(err => {});

        let command;

        if (interaction.isChatInputCommand()) {
            command = client.slash_commands.get(interaction.commandName);
            if (!command) return;
    
            if(await db.get(`n_${interaction.guildId}_${command.data.name}`)) return interaction.reply({ content: 'Este comando está deshabilitado en este servidor.', ephemeral: true });
            
            if(command.requiresCooldown) {
                let cooldown = await db.get(`g_${interaction.guildId}.${command.data.name}.cooldown`);
                let timeout = client.cooldowns.get(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`) || 0;
    
                if(timeout + cooldown > Date.now()) return interaction.reply({ content: `Espera hasta <t:${Math.floor((timeout + cooldown) / 1000)}:t> (<t:${Math.floor((cooldown + timeout) / 1000)}:R>) para usar ${interaction.commandName}.`, ephemeral: true });
                client.cooldowns.set(`c_${interaction.guildId}_${interaction.user.id}_${command.data.name}`, Date.now());
            }

            if (command.daily) {
                const availableFrom = parseTime(dailyFrom);
                let lastDaily = await db.get(`d_${interaction.guildId}_${interaction.user.id}`) || undefined;
    
                if (lastDaily) {
                    lastDaily = new Date(lastDaily);
    
                    if (!isAvailable(lastDaily, availableFrom)) {
                        return interaction.reply(`Espera hasta <t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:t> (<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:R>) para usar ${command.name}.`);
                        
                    } else { 
                        await db.set(`d_${interaction.guildId}_${interaction.user.id}`, Date.now());
                    }
                    
                } else { 
                    await db.set(`d_${interaction.guildId}_${interaction.user.id}`, Date.now());
                }
            }
            
        }
        
        if (interaction.isUserContextMenuCommand()) {
            command = client.menu_commands.get(interaction.commandName);
            if (!command) return;
        }

        try {
            command.run(client, interaction);
        } catch (err) {
            interaction.reply({ content: 'Ocurrió un error con el bot. No eres tú, soy yo :(', ephemeral: true });
            console.error(err);
        }

    }
}