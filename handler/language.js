const { readdirSync } = require('node:fs');

module.exports = (client) => {
    readdirSync("./languages/bot").forEach(dir => {
        let translations = {};
        const commands = readdirSync(`./languages/bot/${dir}`).filter(file => file.endsWith('.json'));

        for (let file of commands) {
            let pull = require(`../languages/bot/${dir}/${file}`);
            translations = {...translations, ...pull };
        }
        
        client.languages.set(dir, translations);
        console.log(`[ Languages ] Loading ${dir}...`);

    });

}