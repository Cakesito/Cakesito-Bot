const { EmbedBuilder } = require('discord.js');

let statuses = {
    'win': 0x56bb74,
    'loose': 0xec5454
}

let amount = {
    'Explore': {
        'leche': [1, 3],
        'polvo': [1, 1],
        '-': [1, 1]
    },
    'Crime': {
        'leche': [2, 4],
        'polvo': [2, 2]
    }
}

let b = {
    'leche': ':milk: Leche',
    'polvo': ':sparkles: Polvo',
    'quesoken': 'Quesoken'
}

class main {
    main (type, stuff, user, pr) {

        if(!stuff.pr) stuff.pr = pr;
            
        let value = stuff[luck(stuff.pr)];
        let money = random(value.min, value.max);
            
        let embed = message(money > 0 ? 'win' : 'loose', money, stuff, user, type);
            
        this.money = money;
        this.embed = embed;

        return this;

    }

    obj (type, stuff, user) {

        let pr = stuff.pr;
        let newobj = {
            obj: "-",
            amount: 1
        }

        let win = luck(pr);
        if(win == 'win') {
            let obj = objLuck2(stuff.opr);
            let objAmount = random(amount[type][obj][0], amount[type][obj][1]);

            newobj = {
                obj: obj,
                amount: objAmount
            }
        }
        
        let embed = objMessage(newobj.obj != '-' ? 'win' : 'loose', user, newobj, stuff, type);
        
        this.embed = embed;
        this.obj = newobj;

        return this;
    }

    mixed (type, stuff, user) {
        let pr = stuff.pr;

        let win = luck(pr);

        let newobj = {
            obj: "-",
            amount: 1
        }

        let value;
        let money;
        
        if(win == 'win') {
            pr = 100;
            
            let obj = objLuck2(stuff.opr);
            
            while (obj == '-') {
                obj = objLuck2(stuff.opr);
            }
            
            let objAmount = random(amount[type][obj][0], amount[type][obj][1]);
            
            newobj = {
                obj: obj,
                amount: objAmount
            }
            
        } 

        if(win == 'loose') pr = 0;

        value = stuff[luck(pr)];
        money = random(value.min, value.max);

        
        let embed = mixedMessage(money > 0 ? 'win' : 'loose', user, newobj, money, stuff);

        this.obj = newobj;
        this.money = money;
        this.embed = embed;

        return this;
    }
}


function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function luck (p) {
    let n = Math.random() * 100;
    if(n <= p) return "win";
    return "loose";
}

function objLuck (p) {
    let pos = [];
    let h = -1;
    for(var i = 0; i < 50; i++) {
        h++;
        if(h > Object.keys(p).length - 1) h = 0;

        let n = Math.floor(Math.random() * 100);

        if(n <= Object.values(p)[h]) {
            pos.push(Object.keys(p)[h]);
        } else {
            let v = Object.values(p);
            if((v[0] + v[1]) != 100) { 
                i--;
                pos.push('-');
            }
        }

        Object.values(p).forEach(e => {
            if(n <= e) x = true;
        });
    }

    return pos[Math.floor(Math.random() * pos.length)];
}

function objLuck2 (p) {
    // console.log(p)
    let prs = Object.values(p);
    let objs = Object.keys(p);
    let n = Math.floor(Math.random() * 100);

    if(n <= prs[1]) return objs[1];
    if(n <= (prs[1] + prs[0])) return objs[0];

    return '-';
}

function message(status, money, txt, user, type) {
    let color = statuses[status] || 0x0099FF;
    let randomText = txt[status].txt[Math.floor(Math.random() * txt[status].txt.length)];

    let embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
    .setDescription(randomText.replace('{money}', money));

    return embed;
    
}

function objMessage (status, user, obj, txt, type) {
    let color = statuses[status] || 0x0099FF;
    let randomText = txt[status].txt[Math.floor(Math.random() * txt[status].txt.length)];

    let embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
    .setDescription(bonito(randomText.replace('{obj}', `${obj.obj} (x${obj.amount})`)));

    if(obj.obj == '-') embed.setDescription(randomText);

    return embed;
}

function mixedMessage (status, user, obj, money, txt) {
    let color = statuses[status] || 0x0099FF;
    let randomText = txt[status].txt[Math.floor(Math.random() * txt[status].txt.length)];

    let embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
    .setDescription(bonito(randomText.replace('{obj}', `${obj.obj} (x${obj.amount})`).replace('{money}', money)));

    if(status != 'win') embed.setDescription(randomText.replace('{money}', money));

    return embed;
}

function bonito (str) {
    let nstr = str;
    Object.keys(b).forEach(e => nstr = nstr.replace(e, b[e]));
    return nstr;
}

module.exports = main;