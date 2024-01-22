const req = require('web-request');
const Level = require('../things/level.js');
const { MessageEmbed } = require('discord.js');
const wd = require('../things/wd')
const face = {
    'unrated': 'https://i.imgur.com/DO57Ksu.png',
    'unrated-featured': 'https://i.imgur.com/mNOp3Pj.png',
    'unrated-epic': 'https://i.imgur.com/7vYhmr2.png',
    'auto': 'https://i.imgur.com/Acq27AO.png',
    'auto-featured': 'https://i.imgur.com/myDbDrl.png',
    'auto-epic': 'https://i.imgur.com/J0jVn5D.png',
    'easy': 'https://i.imgur.com/ktQRxui.png',
    'easy-featured': 'https://i.imgur.com/rnZHRe2.png',
    'easy-epic': 'https://i.imgur.com/OBrv0cP.png',
    'normal': 'https://i.imgur.com/kyJgJb6.png',
    'normal-featured': 'https://i.imgur.com/kieLjN2.png',
    'normal-epic': 'https://i.imgur.com/E9KH3og.png',
    'hard': 'https://i.imgur.com/vuTBCeB.png',
    'hard-featured': 'https://i.imgur.com/XKNzRe2.png',
    'hard-epic': 'https://i.imgur.com/Brh73vm.png',
    'harder': 'https://i.imgur.com/vUUtWMa.png',
    'harder-featured': 'https://i.imgur.com/A966FQA.png',
    'harder-epic': 'https://i.imgur.com/7CsSYOM.png',
    'insane': 'https://i.imgur.com/Juy1At8.png',
    'insane-featured': 'https://i.imgur.com/R6zvJlx.png',
    'insane-epic': 'https://i.imgur.com/VmlkkmZ.png',
    'demon': 'https://i.imgur.com/VBc61ou.png',
    'demon-featured': 'https://i.imgur.com/etqleVD.png',
    'demon-epic': 'https://i.imgur.com/V4UGZlS.png',
    'demon-easy': 'https://i.imgur.com/pVV1cyh.png',
    'demon-easy-featured': 'https://i.imgur.com/Eon5buU.png',
    'demon-easy-epic': 'https://i.imgur.com/8l1SbOj.png',
    'demon-medium': 'https://i.imgur.com/GZynGIz.png',
    'demon-medium-featured': 'https://i.imgur.com/gr4tthB.png',
    'demon-medium-epic': 'https://i.imgur.com/60X6z1p.png',
    'demon-hard': 'https://i.imgur.com/nXY23Q9.png',
    'demon-hard-featured': 'https://i.imgur.com/etqleVD.png',
    'demon-hard-epic': 'https://i.imgur.com/V4UGZlS.png',
    'demon-insane': 'https://i.imgur.com/lSYKH5z.png',
    'demon-insane-featured': 'https://i.imgur.com/FDS3hs5.png',
    'demon-insane-epic': 'https://i.imgur.com/sjatFqZ.png',
    'demon-extreme': 'https://i.imgur.com/9O3ThVs.png',
    'demon-extreme-featured': 'https://i.imgur.com/9KlfjIe.png',
    'demon-extreme-epic': 'https://i.imgur.com/HKFVco5.png',
}

module.exports = {
    run: async (client, message, args) => {

        let id = args[0];

        if(!id) return message.channel.send("Id?")

        if(id == 'daily' || id == 'weekly') {
            let level = await wd(id == 'daily' ? true : false);
            let embedToSend = embed(level);
            return message.channel.send({ embeds: [embedToSend] });
        }

        let form = {
            str: id,
            type: '0',
            secret: 'Wmfd2893gb7'
        }

        let post = await req.post('http://noxiusvgdps.7m.pl/database/getGJLevels21.php', { form: form });
        let body = post.content;

        if (body.startsWith("##") || body.startsWith("-1")) return message.channel.send('ooups');

        let preRes = body.split('#')[0].split('|', 10)
        let author = body.split('#')[1].split('|')[0].split(':')
        let song = '~' + body.split('#')[2];

        song = parse(song, '~|~')

        let levelInfo = parse(preRes.find(x => x.startsWith(`1:${id}`)) || preRes[0])
        let level = new Level(levelInfo, "Geomerty dash", false, author).getSongInfo(song)

        let embedToSend = embed(level);

        message.channel.send({ embeds: [embedToSend] })
        console.log(level)
    }
}

function parse (responseBody, splitter=":") {
    if (!responseBody || responseBody == "-1") return {};
    if (responseBody.startsWith("\nWarning:")) responseBody = responseBody.split("\n").slice(2).join("\n").trim()
    if (responseBody.startsWith("<br />")) responseBody = responseBody.split("<br />").slice(2).join("<br />").trim()
    let response = responseBody.split('#')[0].split(splitter);
    let res = {};
    
    for (let i = 0; i < response.length; i += 2) {
        res[response[i]] = response[i + 1]
    }

    return res;
  }

function embed (level) {
    let embed = new MessageEmbed()
        .setTitle(`**${level.name}** by **${level.author}**`)
        .setThumbnail(face[level.difficultyFace])
        .setDescription(`**Description:** ${level.description}\n\n${level.verifiedCoins ? '<:coin:991111189562151003>' : '<:coin0:804492370325930004>'} **Coins:** ${level.coins}\n<:downloads:991110600811876423> **Downloads:** ${level.downloads}\n<:likes:991111025409671198> **Likes:** ${level.likes}\n<:length:991111393858301992> **Length:** ${level.length}`)
        .addField(`<:info:991114866867834961> **Level Info** ${level.copiedID == '0' ? '' : '<:copied:991377485885358121>'} ${level.large ? '<:highObjects:991377460941819995>' : ''}` , `**Version:** ${level.version}\n**Objects:** ${level.objects}\n${level.copiedID == '0' ? '' : `**Original level:** ${level.copiedID}`}`)
        .addField(`<:noteIcon:991111452440141834> **${level.songName}** by **${level.songAuthor}**`, `${level.songSize} - [${level.songID}](${level.songLink})`)

    return embed;
}