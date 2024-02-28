
const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { readdirSync, writeFileSync } = require('node:fs');

module.exports = {
    ownerOnly: true,
    run: (client, message) => {
        let commands = [];
        
        readdirSync("./commands/slash").forEach(dir => {
            const cmds = readdirSync(`./commands/slash/${dir}/`).filter(file => file.endsWith('.js'));
        
            for (let file of cmds) {
                let pull = require(`../../../commands/slash/${dir}/${file}`);
        
                let cmd = {
                    name: pull.data.name,
                    description: pull.data.description,
                    category: dir,
                    memberPermission: getPermName(pull.data.default_member_permissions),
                    usage: usage(pull.data.name, pull.data.options)
                }
        
                commands.push(cmd);
            }
        });

        message.channel.send(`Cargados ${commands.length} comandos...`);

        try { 
            writeFileSync('./commands.json', JSON.stringify(commands), 'utf-8');
            message.reply({ files: [new AttachmentBuilder(Buffer.from(JSON.stringify(commands)), { name: 'commands.json' })] });
        } catch (err) {
            console.log(err)
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