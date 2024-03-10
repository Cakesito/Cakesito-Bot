const { readdirSync } = require("fs");

module.exports = (client) => {
    readdirSync("./commands_menu").forEach(dir => {
        const commands = readdirSync(`./commands_menu/${dir}/`).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../commands_menu/${dir}/${file}`);

            client.menu_commands.set(pull.data.name, pull);
            console.log(`[ Menu ] Loading ${pull.data.name}`);
        
        }
    });
}