const { readdirSync } = require("fs");

module.exports = (client) => {
    readdirSync("./commands/menu").forEach(dir => {
        const commands = readdirSync(`./commands/menu/${dir}/`).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../commands/menu/${dir}/${file}`);

            client.menu_commands.set(pull.name, pull);
            console.log(`[ Menu ] Loading ${pull.name}`);
        
        }
    });
}