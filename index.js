const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const { token } = require('./config.json');

const { QuickDB } = require('quick.db');
const db = new QuickDB(); 

client.menu_commands = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.collectors = new Collection();
client.languages = new Collection();

client.db = db;

for(let handler of  ["command", "menu_command", "event", "language"]) require(`./handler/${handler}`)(client);

client.login(token);