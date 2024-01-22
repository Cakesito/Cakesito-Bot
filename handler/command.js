const { readdirSync } = require("node:fs")
const ascii = require("ascii-table");

let table = new ascii("Commands");
table.setHeading("Prefix Command", "Load status");

module.exports = (client) => {
    
    const dcommands = readdirSync(`./commands`);
    if(dcommands) {
        dcommands.forEach(dir => {
            if(!dir.endsWith(".js")) {
                const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));

                for (let file of commands) {
                    let pull = require(`../commands/${dir}/${file}`);
                    pull.name = pull.name || file.replace(".js", "");
                    client.commands.set(pull.name, pull);
                    table.addRow(file, '✅');
            
                    if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
                }
            }            
        })
    }

    const commands = readdirSync(`./commands/`).filter(file => file.endsWith(".js"));
    
    for (let file of commands) {
        let pull = require(`../commands/${file}`);
        pull.name = pull.name || file.replace(".js", "");
        client.commands.set(pull.name, pull);
        table.addRow(file, '✅');
        
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
    }

    console.log(table.toString());
}