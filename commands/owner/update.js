const { createWriteStream, unlink } = require('node:fs');
const https = require('node:https');

module.exports = {
    onlyOwner: true,
    runPrefix: (client, comments, message, args) => {
        module.exports.run(client, comments, message, args);
    },
    
    run: (client, comments, message, args) => {
        if (!message.attachments?.first()) return message.reply('att');

        const path = args[0];
        if (!path) return message.reply('-');

        const name = path.split('/').slice(-1)[0].replace('.js', '');
        const category = path.split('/').slice(-2)[0];

        var randomNumber = random(10, 50);
        const randomString = makeRandom(randomNumber);
        
        // random string bc idk
        // it wont work if the files have the same name
        // not knowing js is hitting now
        const tempPath = `./temp/${name}-${randomString}.js`;

        const tempFile = createWriteStream(tempPath);
        const file = createWriteStream(path);

        message.channel.send('Creating files...');

        https.get(message.attachments.first().url, (res) => {
            res.pipe(tempFile);
            res.pipe(file);

            tempFile.on('finish', () => {
                tempFile.close(() => {
                    
                    try {
                        let pull = require(`../..${tempPath.slice(1)}`);
                        pull.category = category;
                        pull.name = name;

                        client.commands.set(name, pull);

                        unlink(tempPath,() => message.channel.send('Deleting file...'));
                        return message.reply(`updated: ${category}: ${name}`);
                    } catch (err) {
                        console.log(err);
                        return message.reply('err');
                    }

                });
            });

            file.on('finish', () => file.close());
        });
    }
}

function makeRandom(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}