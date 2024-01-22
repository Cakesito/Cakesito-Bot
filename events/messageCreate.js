const { time } = require('discord.js');
const { prefix } = require('../config.json');
const ms = require('ms');

module.exports = {
    run: async (client, message) => {
        if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        const db = client.db.get('db');

        let command = client.commands.get(cmd);
        if (!command) command = client.commands.get(client.aliases.get(cmd));
        if(!command) return;

        if(await db.get(`n_${command.name}`)) return;

        if (command.ownerOnly) {
            if (message.author.id != '508356344819220492') return;
        }

        if (command.botPermissions) {
            const Permissions = command.botPermissions.filter(x => !message.guild.me.permissions.has(x)).map(x => "`" + x + "`")
            if (Permissions.length) return message.reply(`I need ${Permissions.join(", ")} permission(s) to execute the command!`)
        } 
          
        if (command.memberPermissions) {
            const Permissions = command.memberPermissions.filter(x => !message.member.permissions.has(x)).map(x => "`" + x + "`")
            if (Permissions.length) return message.reply(`You need ${Permissions.join(", ")} permission(s) to execute this command!`)
        }

        if(command.cooldown) {
            let timeout = await db.get(`c_${command.name}_${message.author.id}`) || 0;
            if(timeout + command.cooldown > Date.now()) return message.reply(`Espera hasta <t:${Math.floor((timeout + command.cooldown) / 1000)}:t> (<t:${Math.floor((command.cooldown + timeout) / 1000)}:R>) para usar ${command.name}.`);
            await db.set(`c_${command.name}_${message.author.id}`, Date.now());
        }

        if(command.tCooldown) {
            let inf = await db.get(`${command.name}_${message.author.id}`);
            if(!inf) { 
                await db.set(`${command.name}_${message.author.id}`, { date: Date.now(), times: 0 }) 
                inf = { date: Date.now(), times: 0 }
            }

            if(inf.date + command.tCooldown[1] > Date.now() && inf.times >= command.tCooldown[0]) {              
                return message.reply(`Espera ${ms(command.tCooldown[2] - (Date.now() - inf.date))} para usar ${command.name}.`);
            } else {

                if(inf.times >= command.tCooldown[0]) {
                    command.run(client, message, args);
                    return await db.set(`${command.name}_${message.author.id}`, { date: Date.now(), times: 1 });
                }

                await db.set(`${command.name}_${message.author.id}.date`, Date.now());
                await db.add(`${command.name}_${message.author.id}.times`, 1);
            }
            
        }

        command.run(client, message, args);
    }
}