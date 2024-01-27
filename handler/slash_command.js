const { readdirSync } = require("fs");

module.exports = (client) => {
    readdirSync("./commands/slash").forEach(dir => {
        const commands = readdirSync(`./commands/slash/${dir}/`).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../commands/slash/${dir}/${file}`);

            client.slash_commands.set(pull.data.name, pull);
            console.log(`[SLASH] Loading ${file}`);
        
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });
}