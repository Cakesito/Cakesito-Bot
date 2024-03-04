const { EmbedBuilder } = require("discord.js");
const balance = require('../../../base_commands/balance');

module.exports = {
    aliases: ['bal'],
    run: async (client, message, args) => {

        const db = client.db.get('db');
        let member = message.member;

        if (args[0]) {

            const cache = message.guild.members.cache.map(x => {
                return { id: x.id, member: x };
            });

            member = message.mentions.members.first() || cache.find(x => x.id === args[0])?.member;
            if (!member && Number(args[0])) member = await message.guild.members.fetch(args[0]);
            if (!member && !Number(args[0])) member = await message.guild.members.search({ query: args[0] });

            if (member.size) {
                if (member.size > 1) {

                    let users = [];
                    let desc = [];
                    let i = 0;

                    member.forEach(m => {
                        users.push(m);
                        desc.push(`${i + 1}. ${m.user.displayName} ` + '(`' + m.user.tag + '`)');
                        i++;
                    });

                    let embed = new EmbedBuilder()
                    .setDescription(`He encontrado ${desc.length} usuarios:\n\n${desc.slice(0, 9).join('\n')}\nSeleccione un usuario (un número) o escribe cancelar.`)
                    .setColor(0x0099FF)
                    .setTimestamp();

                    message.reply({ embeds: [embed] });

                    let filter = function (m) {
                        if (m.author.id == message.author.id) {
                            if (m.content.toLowerCase().startsWith('cancelar')) return m.reply('Cancelado.');

                            if (isNaN(Number(m.content)) || Number(m.content) > desc.length) {
                                m.reply(`Escribe un número entre 1 y ${desc.length}`);
                                return false;
                            }

                            return true;
                        }

                        return false;
                    }

                    let number = await message.channel.awaitMessages({ filter, time: 20_000, errors: ['time'], max: 1 });

                    if (number.first().content.toLowerCase().startsWith('cancelar')) return;

                    message = number.first();
                    member = member.at(number.first().content - 1);
                    
                } else {

                    member = member.first();
                    if(member.user.bot) return message.reply('El usuario elegido es un bot.');
    
                }

            } 

            if(!member.user) return message.reply('No pude encontrar el usuario.');
            if(member.user.bot) return message.reply('El usuario elegido es un bot.');

        }

        balance(message, db, { member: member });
    }
}