const { default_prefix, ownerId, dailyFrom } = require('../config.json');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    run: async (client, message) => {
        const db = client.db;
        var prefix = await db.get(`g_${message.guildId}.prefix`) || default_prefix;

        var mention = `<@${client.user.id}>`;
        if(message.author.bot || !message.guild) return;

        let args = message.content.slice(prefix.length).trim().split(/ +/g);

        if (message.mentions.has(client.user.id)) {
            args = message.content.slice(mention.length).trim().split(/ +/g);
            if (args[0] === 'prefix') return message.reply(`Mi prefix en este servidor es: \`${prefix}\``);

        } else if (!message.content.startsWith(prefix)) return;

        const cmd = args.shift().toLowerCase();

        let command = client.commands.get(cmd);
        if (!command) command = client.commands.get(client.aliases.get(cmd));
        if(!command) return;

        if(await db.get(`n_${message.guild.id}_${command.name}`)) return message.reply({ content: 'Este comando está deshabilitado en este servidor.' })

        if (command.onlyOwner && message.author.id !== ownerId) return;

        // if (command.botPermissions) {
        //     let permissions = command.botPermissions.filter(x => !message.guild.me.permissions.has(x)).map(x => "`" + x + "`");
        //     if (permissions.length) return message.reply(`Necesito ${permissions.length > 1 ? 'los permisos' : 'el permiso'}: ${Permissions.join(", ")}.`);
        // }

        if (command.data?.default_member_permissions) {
            if (!message.member.permissions.has(command.data.default_member_permissions)) 
                return message.reply(`Necesitas el permiso: \`${getPermName(command.data.default_member_permissions)}\` para usar este comando.`);
        }

        if (command.requiresCooldown) {
            let cooldown = await db.get(`g_${message.guildId}.${command.name}.cooldown`);
            let timeout = client.cooldowns.get(`c_${message.guild.id}_${message.author.id}_${command.name}`) || 0;

            if(timeout + cooldown > Date.now()) return message.reply(`Espera hasta <t:${Math.floor((timeout + cooldown) / 1000)}:t> (<t:${Math.floor((cooldown + timeout) / 1000)}:R>) para usar ${command.name}.`);
            client.cooldowns.set(`c_${message.guild.id}_${message.author.id}_${command.name}`, Date.now());
        }

        try {
            command.runPrefix(client, message, args);
        } catch (err) {
            message.reply('Ocurrió un error con el bot. No eres tú, soy yo :(');
            console.error(err);
        }
    }
}

function getPermName(bitfield = 0) {
    for (let key in PermissionsBitField.Flags) 
      if (PermissionsBitField.Flags[key] == bitfield) return key;
    return undefined;
}