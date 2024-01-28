const { default_prefix, clientId, ownerId } = require('../config.json');

module.exports = {
    run: async (client, message) => {
        const db = client.db.get('db');
        var prefix = await db.get(`p_${message.guild.id}`) || default_prefix;
        var regex = new RegExp(`<@${clientId}>`, 'g');

        if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        let command = client.prefix_commands.get(cmd);
        if (!command) command = client.prefix_commands.get(client.aliases.get(cmd));
        if(!command) return;

        if(await db.get(`n_${message.guild.id}_${command.name}`)) return message.reply({ content: 'Este comando está deshabilitado en este servidor.' })

        if (command.ownerOnly) {
            if (message.author.id != ownerId) return;
        }

        if (command.botPermissions) {
            let permissions = command.botPermissions.filter(x => !message.guild.me.permissions.has(x)).map(x => "`" + x + "`");
            if (permissions.length) return message.reply(`Necesito ${permissions.length > 1 ? 'los permisos' : 'el permiso'}: ${Permissions.join(", ")}.`);
        } 
          
        if (command.memberPermissions) {
            let permissions = command.memberPermissions.filter(x => !message.member.permissions.has(x)).map(x => "`" + x + "`")
            if (permissions.length) return message.reply(`Necesitas ${permissions.length > 1 ? 'los permisos' : 'el permiso'}: ${permissions.join(", ")} para ejecutar este comando.`)
        }

        if(command.cooldown) {
            let timeout = client.cooldowns.get(`c_${message.guild.id}_${message.author.id}_${command.name}`) || 0;

            if(timeout + command.cooldown > Date.now()) return message.reply(`Espera hasta <t:${Math.floor((timeout + command.cooldown) / 1000)}:t> (<t:${Math.floor((command.cooldown + timeout) / 1000)}:R>) para usar ${command.name}.`);
            client.cooldowns.set(`c_${message.guild.id}_${message.author.id}_${command.name}`, Date.now());
        }

        command.run(client, message, args);
    }
}