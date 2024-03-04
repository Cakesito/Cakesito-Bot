const { date } = require('yup');
const { default_prefix, ownerId, dailyFrom } = require('../config.json');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');
        var prefix = await db.get(`g_${message.guildId}.prefix`) || default_prefix;

        var mention = `<@${client.user.id}>`;
        if(message.author.bot || !message.guild) return;

        let args = message.content.slice(prefix.length).trim().split(/ +/g);

        if (message.mentions.has(client.user.id)) {
            args = message.content.slice(mention.length).trim().split(/ +/g);
        } else if (!message.content.startsWith(prefix)) return;

        const cmd = args.shift().toLowerCase();

        let command = client.prefix_commands.get(cmd);
        if (!command) command = client.prefix_commands.get(client.aliases.get(cmd));
        if(!command) return;

        if(await db.get(`n_${message.guild.id}_${command.name}`)) return message.reply({ content: 'Este comando está deshabilitado en este servidor.' })

        if (command.ownerOnly && message.author.id !== ownerId) return;

        if (command.botPermissions) {
            let permissions = command.botPermissions.filter(x => !message.guild.me.permissions.has(x)).map(x => "`" + x + "`");
            if (permissions.length) return message.reply(`Necesito ${permissions.length > 1 ? 'los permisos' : 'el permiso'}: ${Permissions.join(", ")}.`);
        } 
          
        if (command.memberPermissions) {
            let permissions = command.memberPermissions.filter(x => !message.member.permissions.has(x)).map(x => "`" + x + "`")
            if (permissions.length) return message.reply(`Necesitas ${permissions.length > 1 ? 'los permisos' : 'el permiso'}: ${permissions.join(", ")} para usar este comando.`)
        }

        if (command.requiresCooldown) {
            let cooldown = await db.get(`g_${message.guildId}.${command.name}.cooldown`);
            let timeout = client.cooldowns.get(`c_${message.guild.id}_${message.author.id}_${command.name}`) || 0;

            if(timeout + cooldown > Date.now()) return message.reply(`Espera hasta <t:${Math.floor((timeout + cooldown) / 1000)}:t> (<t:${Math.floor((cooldown + timeout) / 1000)}:R>) para usar ${command.name}.`);
            client.cooldowns.set(`c_${message.guild.id}_${message.author.id}_${command.name}`, Date.now());
        }

        if (command.daily) {
            const availableFrom = parseTime(dailyFrom);
            let lastDaily = await db.get(`d_${message.guildId}_${message.author.id}`) || undefined;

            if (lastDaily) {

                if (lastDaily > availableFrom.getTime()) {
                    return message.reply(`Espera hasta <t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:t> (<t:${Math.floor((Date.now() + (availableFrom.getTime() - Date.now()) + 86400000) / 1000)}:R>) para usar ${command.name}.`);
                    
                } else { 
                    await db.set(`d_${message.guildId}_${message.author.id}`, Date.now());
                }
                
            } else { 
                await db.set(`d_${message.guildId}_${message.author.id}`, Date.now());
            }
        }

        try {
            command.run(client, message, args);
        } catch (err) {
            message.reply('Ocurrió un error con el bot. No eres tú, soy yo :(');
            console.error(err);
        }
    }
}

function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date;
}