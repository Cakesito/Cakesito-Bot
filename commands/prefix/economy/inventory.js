const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    aliases: ['inv'],
    run: async (client, message, args) => {

        const db = client.db.get('db');
        const materials = await db.get(`g_${message.guildId}.materials`);
        const items = await db.get(`g_${message.guildId}.craft.items`);

        let member = message.member;

        if (args[0]) {

            member = message.mentions.members.first() || message.guild.members.cache.filter(m => Number(args[0]) ? m.user.id == args[0] : m.user.username.toLowerCase().startsWith(args.join(' ').toLowerCase()));
            if (!member && Number(args[0])) member = await message.guild.members.fetch(args[0]);
            if (!member && !Number(args[0])) member = await message.guild.members.search(args[0]);

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
                    .setDescription(`He encontrado ${desc.length} usuarios:\n\n${desc.slice(0, 9).join('\n')}\nSeleccione un usuario (un número) o escriba cancelar.`)
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

        var id = client.collectors.get('active') || 0;
        client.collectors.set('active', id + 1);

        const materialsOption = new StringSelectMenuOptionBuilder()
            .setLabel('Materiales')
            .setValue('materials')
            .setDefault(true)
        
        const objectOption = new StringSelectMenuOptionBuilder()
            .setLabel('Objetos')
            .setValue('objects')

        const select = new StringSelectMenuBuilder()
            .setPlaceholder('Selecciona')
            .setCustomId(`cake-i-${id}`)
            .addOptions(materialsOption, objectOption);

        let inv = await db.get(`e_${member.guild.id}_${member.user.id}.inv`);

        let invEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTimestamp();

        let invMaterialsText = [];
        let invObjectsText = [];

        if(inv) {
            Object.entries(inv).forEach(e => {
                if (e[1] === 0) return;

                let material = materials.find(x => x.name === e[0]) || items.find(x => x.name === e[0]);
                if (!material) return;
                var field = { name: `x${e[1]} **${e[0]}**`, value: material?.description == "" ? '_Este objeto no tiene descripción_' : material?.description };

                if (material) {
                    invMaterialsText.push(field);
                } else invObjectsText.push(field);

            });

            invEmbed.setFields(invMaterialsText);

        } else invEmbed.setDescription('Parece que no hay nada...');

        const filter = (i) => i.customId === `cake-i-${id}` && i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 300_000 });

        collector.on('collect', async i => {
            if (i.values[0] === 'objects') {
                materialsOption.setDefault(false);
                objectOption.setDefault(true);

                if (invObjectsText.length) {
                    invEmbed.setFields(invObjectsText);
                    invEmbed.setDescription(null);
                } else {
                    invEmbed.setDescription('Parece que no hay nada...');
                    invEmbed.setFields([]);
                }

            } else {
                materialsOption.setDefault(true);
                objectOption.setDefault(false);
                
                if (invMaterialsText.length) {
                    invEmbed.setDescription(null);
                    invEmbed.setFields(invMaterialsText);
                } else {
                    invEmbed.setDescription('Parece que no hay nada...');
                    invEmbed.setFields([]);
                }
            }

            await i.update({ embeds: [invEmbed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(select)] })
        });

        collector.on('end', () => client.collectors.set('active', id - 1));

        return message.reply({ embeds: [invEmbed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(select)] });
        
    }
}