const { readdirSync } = require("fs");

module.exports = (client) => {
    readdirSync("./commands/prefix").forEach(dir => {
        const commands = readdirSync(`./commands/prefix/${dir}/`).filter(file => file.endsWith('.js'));

        for (let file of commands) {
            let pull = require(`../commands/prefix/${dir}/${file}`);
            pull.name = pull.name || file.replace(".js", "");
            pull.category = pull.category || dir;
            client.prefix_commands.set(pull.name, pull);

            console.log(`[ Prefix ] Loading ${file}`);
        
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        
        }
    });
}