const { readFileSync, createWriteStream } = require('node:fs');
const https = require('node:https');

module.exports = {
    onlyOwner: true,
    runPrefix: (client, message, args) => module.exports.run(client, message, args),
    
    run: (client, message, args) => {
        const path = args[0];
        if (!path) return message.reply('-');

        const name = path.split('/').slice(-1)[0].replace('.js', '');
        if (!name) return message.reply('.');

        const category = path.split('/').slice(-2)[0];

        const file = createWriteStream(path);
        https.get(message.attachments.first().url, (res) => {
            res.pipe(file);

            file.on('finish', () => { 
                file.close(() => {
                    var content = readFileSync(path, 'utf-8');
                    content = thingy(content, category, name);
                    content = eval(content);
                    
                    try {
                        client.commands.set(name, content);
                        message.reply(`updated: ${category}, ${name}`);
                    } catch (err) {
                        console.log(err);
                        return message.reply('err');
                    }
                });
            });
        });
    }
}

function thingy (str, cat, name) {
    var contents = str.split('module.exports = {');
    return `${contents[0]}\nmodule.exports = { name: "${name}", category: "${cat}", ${contents.slice(1).join('\n')}`;
}