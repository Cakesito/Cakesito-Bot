const ejs = require('ejs');
const express = require('express');
const Strategy = require('passport-discord').Strategy;
const passport = require('passport');
const session = require('express-session');
const bodyParser = require("body-parser");
const path = require('path');
const url = require("url");
const { PermissionsBitField } = require('discord.js');
const { clientSecret, clientId, discordInvite } = require('../config.json');
const defaultEconomy = require('../default_economy.json');

const app = express();
const MemoryStore = require("memorystore")(session);

module.exports = async (client) => {

    client.discordInvite = discordInvite;
    const db = client.db.get('db');

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    // 'http://localhost:53134';

    passport.use(
        new Strategy(
            {
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: 'http://localhost:53134/callback',
                scope: ['identify', 'guilds']
            },
            (acessToken, refreshToken, profile, done) => {
                process.nextTick(() => done(null, profile));
            },
        ),
    );

    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
        resave: false,
        saveUninitialized: false
    }));

    // app.set('views', path.resolve(`${process.cwd()}${path.sep}dashboard${path.sep}templates`));

    app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}dashboard${path.sep}css`)));
    app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}dashboard${path.sep}js`)));

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = 'localhost:53134';

    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const renderTemplate = (res, req, template, data = {}) => {
        const baseData = {
            bot: client,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null
        }

        res.render(path.resolve(__dirname + `/templates/${template}`), Object.assign(baseData, data));
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

    app.post("/dashboard/:guildId/:setting", checkAuth, async (req, res) => {

        const guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) return res.redirect("/dashboard");

        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");

        if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard");
        
        // await db.set(`g_${guild.id}.${req.body.setting}`, req.body.data);

        console.log(req.body);

    });

    app.listen(53134, () => console.log('Listening port 53134'));

}