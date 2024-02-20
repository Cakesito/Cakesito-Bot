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
const Redis = require('ioredis');
const redisClient = new Redis({ enableOfflineQueue: false });
const { RateLimiterRedis } = require('rate-limiter-flexible');
const { PermissionsBitField } = require('discord.js');
const { clientSecret, clientId, discordInvite } = require('../config.json');
const { validate } = require('./check');
const { updateCommand } = require('./updateCommand');

const app = express();
const MemoryStore = require("memorystore")(session);

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 10;

const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    useRedisPackage: true,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByUsernameAndIP,
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
});

module.exports = async (client) => {

    const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

    async function limiter (req, res, guildId, successful) {
        const ipAddr = req.ip;
        const usernameIPkey = getUsernameIPkey(guildId, ipAddr);

        const [resUsernameAndIP, resSlowByIP] = await Promise.all([
            limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
            limiterSlowBruteByIP.get(ipAddr),
        ]);

        let retrySecs = 0;

        // Check if IP or Username + IP is already blocked
        if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
            retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
        } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
            retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
        }

        if (retrySecs > 0) {
            res.set('Retry-After', String(retrySecs));
            res.status(429).json({ message: 'Too many requests' });

        } else {

            if (!successful) {
                try {
                    await limiterSlowBruteByIP.consume(ipAddr);
                    await limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey);

                } catch (err) {
                    if (err instanceof Error) {
                        console.error(err.stack);
                        res.status(500);
                    } else {
                        res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                        res.status(429).json({ message: 'Too many requests' });
                    }
                }
            }

            if (successful) {
                if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
                    // Reset on successful authorisation
                    await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
                }
            }

        }
    }

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

    app.use(helmet());
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

    app.locals.domain = 'localhost:53134';

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

    app.post("/dashboard/:guildId/:setting", checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) return res.redirect("/dashboard");

        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");

        if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard");

        let settings = await db.get(`g_${guild.id}`);
        const validationResult = validate(req.body, settings);

        await limiter(req, res, guild.id, validationResult.valid);

        if (validationResult.valid) {
            await db.set(`g_${guild.id}.${req.body.setting}`, validationResult.parsed);
            
            if (validationResult.requiresUpdate) {
                res.status(202);
                
                try {
                    await updateCommand(req.body, guild);
                    return res.status(200).json({ message: ["Cambios guardados."] });
                } catch (err) {
                    return res.status(400).json({ message: [err] });
                }

            } else res.status(200);

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

}