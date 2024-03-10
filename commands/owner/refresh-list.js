const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { writeFileSync } = require('node:fs');

module.exports = {
    onlyOwner: true,
    runPrefix: (client, message) => module.exports.run(client, message),

    run: (client, message) => {
        let commands = [];

        client.commands.every(cmd => {
            if (cmd.category === 'owner') return false;

            let pull = {
                name: cmd.data?.name || cmd.name,
                description: cmd.data?.description,
                category: cmd.category,
                memberPermission: getPermName(cmd.data?.default_member_permissions),
                usage: usage(cmd.data?.name || cmd.name, cmd.data?.options)
            }

            commands.push(pull);
            return true;
        });

        message.channel.send(`Cargados ${commands.length} comandos...`);

        try { 
            writeFileSync('./dashboard/others/commands.json', JSON.stringify(commands), 'utf-8');
            message.reply({ files: [new AttachmentBuilder(Buffer.from(JSON.stringify(commands)), { name: 'commands.json' })] });
        } catch (err) {
            console.log(err);
            message.reply('err');
        }
        
    }
}

function usage (name, options = []) {
    var usage = "";
    options.forEach(opt => {
        var choicesText = "";

        if (opt.choices) {
            choicesText = `${opt.name}: ` + opt.choices.map(x => x.name).join(' | ');
        } else choicesText = opt.name;
        
        return usage = usage + ` ${opt.required ? '<' + choicesText + '>' : '[' + choicesText + ']' }`;
    });

    return `${name}${usage}`;
}

function getPermName(bitfield = 0) {
    for (let key in PermissionsBitField.Flags) 
      if (PermissionsBitField.Flags[key] == bitfield) return key;
    return undefined;
}