const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const { token } = require('./config.json');

const { QuickDB } = require('quick.db');
const db = new QuickDB(); 

client.commands = new Collection();
// client.slash_commands = new Collection();

client.aliases = new Collection();
client.timeout = new Collection();
client.db = new Collection();

client.db.set('db', db);

for(let handler of  ["command", "event"]) require(`./handler/${handler}`)(client);

client.login(token);