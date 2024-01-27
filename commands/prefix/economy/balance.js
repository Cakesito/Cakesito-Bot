const { EmbedBuilder } = require("discord.js");

module.exports = {
    aliases: ['bal'],
    run: async (client, message, args) => {

        const db = client.db.get('db');
        let member = message.member;

        if (args[0]) {

            member = message.mentions.members.first() || message.guild.members.cache.filter(m => Number(args[0]) ? m.user.id == args[0] : m.user.username.toLowerCase().startsWith(args.join(' ').toLowerCase()));

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

                    let number = await message.channel.awaitMessages({ filter, time: 20000, errors: ['time'], max: 1 });

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

        let bal = await db.get(`e_${member.guild.id}_${member.user.id}`);
        if (!bal) bal = { cash: 0, bank: 0 };

        bal.cash = bal.cash ? bal.cash : 0;
        bal.bank = bal.bank ? bal.bank : 0;

        let balEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .addFields(
            { name: 'Cash', value: `<:star:991110840780599336> ${bal.cash}`, inline: true },
            { name: 'Bank', value: `<:star:991110840780599336> ${bal.bank}`, inline: true },
            { name: 'Total', value: `<:star:991110840780599336> ${bal.cash + bal.bank}`, inline: true }
        )
        .setTimestamp();

        return message.reply({ embeds: [balEmbed], allowedMentions: { repliedUser: false } });
        
    }
}