const { readdirSync } = require("fs");

module.exports = (client) => {
    readdirSync("./commands").forEach(dir => {
        if (dir === 'util') return;
        
        const commands = readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);

            pull.name = pull.data?.name || file.replace(".js", "");
            pull.category = pull.category || dir;
            client.commands.set(pull.name, pull);

            console.log(`[ Command ] Loading ${dir} - ${file}`);
        
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        
        }
    });
}