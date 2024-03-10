const { EmbedBuilder } = require('discord.js');

module.exports = async (message, args, limit = 10) => {
    let member = message.member;

        if (args[0]) {

            member = message.mentions.members.first();
            if (!member && Number(args[0])) member = await message.guild.members.resolve(args[0]);
            if (!member && !Number(args[0])) member = await message.guild.members.search({ query: args[0], limit: limit });

            if (member?.size) {
                if (member.size > 1) {

                    let users = [];
                    let desc = [];
                    let i = 0;

                    member.forEach(m => {
                        if (m.user.bot) return;
                        users.push(m);
                        desc.push(`${i + 1}. ${m.user.displayName} ` + '(`' + m.user.tag + '`)');
                        i++;
                    });

                    if (users.length === 1) return member.first();

                    let embed = new EmbedBuilder()
                    .setDescription(`He encontrado ${desc.length} usuarios:\n\n${desc.slice(0, 9).join('\n')}\nSelecciona un usuario (un número) o escribe cancelar.`)
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

                    if (number.first().content.toLowerCase().startsWith('cancelar')) return 'cancel';

                    message = number.first();
                    member = member.at(number.first().content - 1);
                    
                } else {

                    member = member.first();
                    if(member.user.bot) return message.reply('El usuario elegido es un bot.');
    
                }

            }
        }

    if(member?.user.bot) return message.reply('El usuario elegido es un bot.');
    
    return member;
}