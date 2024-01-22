const Level = require('./level');
const request = require('web-request');

module.exports = async (daily) => {
    let id = '-2';
    if(daily) id = '-1';

    let post = await request.post('http://www.boomlings.com/database/downloadGJLevel22.php', { form: { levelID: id, secret: 'Wmfd2893gb7' }});
    let body = post.content;
    
    let levelInfo = parse(body)
    let level = new Level(levelInfo, 'Geometry Dash', true)

    if(level.author == '-') {
        let post = await request.post('http://www.boomlings.com/database/getGJUsers20.php', { form: { str: level.playerID, secret: 'Wmfd2893gb7' }})
        level.author = parse(post.content)[1]
    }

    if(!level.customSong == 0) {
        let post = await request.post('http://www.boomlings.com/database/getGJSongInfo.php', { form: { songID: level.customSong, secret: 'Wmfd2893gb7' }});
        let song = level.getSongInfo(parse(post.content, '~|~'));

        level.songName = song.songName;
        level.songAuthor = song.songAuthor;
        level.songSize = song.songSize;
        level.songID = song.songID;
        level.songLink = song.songLink;
    }
    
    return level;
        
}

function parse (responseBody, splitter=":") {
    if (!responseBody || responseBody == "-1") return {};
    if (responseBody.startsWith("\nWarning:")) responseBody = responseBody.split("\n").slice(2).join("\n").trim() // GDPS'es are wild
    if (responseBody.startsWith("<br />")) responseBody = responseBody.split("<br />").slice(2).join("<br />").trim() // Seriously screw this
    let response = responseBody.split('#')[0].split(splitter);
    let res = {};
    for (let i = 0; i < response.length; i += 2) {
    res[response[i]] = response[i + 1]}
    return res  
}