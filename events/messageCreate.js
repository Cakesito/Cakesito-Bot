const { default_prefix, ownerId } = require('../config.json');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    run: async (client, message) => {
        const db = client.db;
        let prefix = await db.get(`g_${message.guildId}.prefix`) || default_prefix;
        let comments = await db.get(`g_${message.guildId}.lang`) || 'es';
        comments = client.languages.get(comments);

        let mention = `<@${client.user.id}>`;
        if(message.author.bot || !message.guild) return;

        let args = message.content.slice(prefix.length).trim().split(/ +/g);

        if (message.mentions.has(client.user.id)) {
            args = message.content.slice(mention.length).trim().split(/ +/g);
            if (args[0] === 'prefix') return message.reply(comments.actualPrefix.replace('{prefix}', prefix));

        } else if (!message.content.startsWith(prefix)) return;

        const cmd = args.shift().toLowerCase();

        let command = client.commands.get(cmd);
        if (!command) command = client.commands.get(client.aliases.get(cmd));
        if(!command) return;

        if(await db.get(`n_${message.guild.id}_${command.name}`)) return message.reply(comments.commandNotActive);

        if ((command.onlyOwner || command.category === 'owner') && message.author.id !== ownerId) return;

        if (command.data?.default_member_permissions) {
            if (!message.member.permissions.has(command.data.default_member_permissions)) 
                return message.reply(comments.missingPermissions.replace('{perm}', getPermName(command.data.default_member_permissions)));
        }

        if (command.requiresCooldown) {
            let cooldown = await db.get(`g_${message.guildId}.${command.name}.cooldown`);
            let timeout = client.cooldowns.get(`c_${message.guild.id}_${message.author.id}_${command.name}`) || 0;
            let time = Math.floor((timeout + cooldown) / 1000);

            if(timeout + cooldown > Date.now()) return message.reply(comments.cooldown.replace(/\{time\}/g, time).replace('{command}', command.name));
            client.cooldowns.set(`c_${message.guild.id}_${message.author.id}_${command.name}`, Date.now());
        }

        try {
            command.runPrefix(client, comments, message, args);
        } catch (err) {
            message.reply(comments.error);
            console.error(err);
        }
    }
}

function getPermName(bitfield = 0) {
    for (let key in PermissionsBitField.Flags) 
      if (PermissionsBitField.Flags[key] == bitfield) return key;
    return undefined;
}