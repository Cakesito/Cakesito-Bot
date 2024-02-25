const ejs = require('ejs');
const express = require('express');
const Strategy = require('passport-discord').Strategy;
const passport = require('passport');
const session = require('express-session');
const bodyParser = require("body-parser");
const path = require('path');
const url = require("url");
const defaultEconomy = require('../default_economy.json');
const fs = require('node:fs');
const helmet = require('helmet');
const { PermissionsBitField, Client, GatewayIntentBits } = require('discord.js');
const { clientSecret, clientId, discordInvite, token, domain } = require('../config.json');
const { validate } = require('./check');
const { updateCommand } = require('./updateCommand');
const { rateLimit } = require('express-rate-limit');

const { QuickDB } = require('quick.db');
const db = new QuickDB();

const app = express();
const MemoryStore = require("memorystore")(session);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.login(token);

client.discordInvite = discordInvite;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 'http://localhost:53134';

passport.use(
    new Strategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: domain + '/callback',
            scope: ['identify', 'guilds']
        },
        (acessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        },
    ),
);

const limiter = rateLimit({
    windowMs: 60 * 15 * 1000,
    limit: 100,
    standardHeaders: 'draft-6',
    legacyHeaders: false,
    message: { message: ["Inténtelo de nuevo más tarde"] }
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            'img-src': ["'self'", "cdn.discordapp.com"]
        }
    }
}));

app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    resave: false,
    saveUninitialized: false
}));

app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}dashboard${path.sep}css`)));
app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}dashboard${path.sep}js`)));

app.use(passport.initialize());
app.use(passport.session());

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const renderTemplate = (res, req, template, data = {}) => {
    const directory = path.resolve(__dirname + `/templates/${template}`);
    const baseData = {
        bot: client,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null
    }

    if (!fs.existsSync(directory)) return res.status(404);
    res.render(directory, Object.assign(baseData, data));
}

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect('/login');
};

app.get('/login', (req, res, next) => {
    if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);

        if (parsed.hostname === app.locals.domain) {
            req.session.backURL = parsed.path;
        }
    } else {
        req.session.backURL = '/';
    }

    next();
}, passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' } ), (req, res) => {
    
    if (req.session.backURL) {
        const backURL = req.session.backURL;
        req.session.backURL = null;
        res.redirect(backURL);
        } else {
        res.redirect("/dashboard");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        req.logout(() => {});
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    renderTemplate(res, req, 'index.ejs', { discordInvite: discordInvite });
});

app.get('/dashboard', checkAuth, (req, res) => {
    renderTemplate(res, req, 'dashboard.ejs', { perms: PermissionsBitField });
});

app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);

    if (!guild) return res.redirect("/dashboard");
    let member = guild.members.cache.get(req.user.id);

    if (!member) {
        try {
            await guild.members.fetch();
            member = guild.members.cache.get(req.user.id);
        } catch (err) {
            console.error(`Couldn't fetch the members of ${guild.id}: ${err}`);
        }
    }

    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.redirect("/dashboard");

    res.redirect(`/dashboard/${guild.id}/prefix`);

});

app.get("/dashboard/:guildId/:setting", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);

    if (!guild) return res.redirect("/dashboard");
    let member = guild.members.cache.get(req.user.id);

    if (!member) {
        try {
            await guild.members.fetch();
            member = guild.members.cache.get(req.user.id);
        } catch (err) {
            console.error(`Couldn't fetch the members of ${guild.id}: ${err}`);
        }
    }

    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.redirect("/dashboard");

    let storedSettings = await db.get(`g_${guild.id}`);
    if (!storedSettings) await db.set(`g_${guild.id}`, defaultEconomy);

    renderTemplate(res, req, `/settings/${req.params.setting}.ejs`, {
        guild,
        settings: storedSettings ?? defaultEconomy,
        alert: null
    });

});

app.post("/dashboard/:guildId/:setting", checkAuth, limiter, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.redirect("/dashboard");

    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    
    if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard");
    
    let settings = await db.get(`g_${guild.id}`);
    const validationResult = validate(req.body, settings);

    if (validationResult.valid) {
        await db.set(`g_${guild.id}.${req.body.setting}`, validationResult.parsed);
        
        if (validationResult.requiresUpdate) {
            res.status(202);
            
            try {
                await updateCommand(req.body, guild);
                res.status(200).json({ message: ["Cambios guardados."] });
                
            } catch {
                res.status(424).json({ message: ["Error al intentar actualizar los comandos (/) del servidor.", "Los cambios SÍ fueron guardados por el bot."] });
            }

        } else res.status(200).json({ message: ['Cambios guardados.'] });

    } else res.status(400).json({ message: validationResult.err });
    
});

app.use((req, res) => {
    res.status(404);
    renderTemplate(res, req, 'error.ejs', { 
        discordInvite: discordInvite, 
        code: '404', 
        codeMessage: 'No encontrado', 
        message: 'Parece que te has perdido un poco...' 
    });
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500);
    renderTemplate(res, req, 'error.ejs', { 
        discordInvite: discordInvite, 
        code: '500',
        codeMessage: 'Error interno',
        message: 'Hubo un error con el servidor...' 
    });
});

app.listen(53134, () => console.log('[ Dashboard ] : Listening port 53134'));