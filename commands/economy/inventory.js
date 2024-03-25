const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fix = require('../util/fix');

module.exports = {
    aliases: ['inv'],
    data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Mira tu inventario o el de un usuario')
    .setDescriptionLocalizations({
        "en-GB": "View your inventory or an user's inventory",
        "en-US": "View your inventory or an user's inventory"
    })
    .addUserOption(option => 
        option.setName('usuario')
        .setDescription('Mira el inventario de un usuario')
        .setDescriptionLocalizations({
            "en-GB": "View an user's inventory",
            "en-US": "View an user's inventory"
        })
    ),

    runPrefix: async (client, comments, message, args) => {
        const member = await require('../util/selectMember')(message, args);
        if (member.bot) return message.reply(comments.botSelected);
        if (!member.found) return message.reply(comments.userNotFound);

        module.exports.run(message, comments, client.db, { client: client, member: member.member });
    },

    runSlash: (client, comments, interaction) => {
        const member = interaction.options.getMember('usuario') || interaction.member;
        if (member.user.bot) return interaction.reply({ content: comments.botSelected, ephemeral: true });

        module.exports.run(interaction, comments, client.db, { client, member });
    },

    run: async (message, comments, db, { client, member }) => {
        message = fix(message);
    
        const materials = await db.get(`g_${message.guildId}.materials`);
        const items = await db.get(`g_${message.guildId}.craft.items`);
    
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
    
        const materialInv = await db.get(`e_${message.guildId}_${member.user.id}.inv.materials`) || {};
        const objectInv = await db.get(`e_${message.guildId}_${member.user.id}.inv.objects`) || {};
    
        let materialEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.displayAvatarURL() })
            .setTimestamp();
    
        let objectEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: member.user.displayName || member.user.username, iconURL: member.displayAvatarURL() })
            .setTimestamp();
    
        var invMaterialsText = [];
        var invObjectsText = [];
    
        Object.entries(materialInv).forEach(material => {
            // material[0] = _id, material[1] = amount
            if (material[1] === 0 || !material[1]) return;
            
            var mat = materials.find(x => x.id == material[0].slice(1));
            if (mat) {
                invMaterialsText.push({ 
                    name: `x${material[1]} **${mat.name}**`,
                    value: !mat.description || mat.description === '' ? comments.missingMaterialDescription : mat.description
                });
            }
        });
        
        Object.entries(objectInv).forEach(object => {
            // object[0] = _id, object[1] = amount
            if (object[1] === 0 || !object[1]) return;
    
            var obj = items.find(x => x.id == object[0].slice(1));
            if (obj) {
                invObjectsText.push({ 
                    name: `x${object[1]} **${obj.name}**`,
                    value: !obj.description || obj.description === '' ? comments.missingObjectDescription : obj.description
                });
            }
        });
    
        materialEmbed.setFields(invMaterialsText);
        objectEmbed.setFields(invObjectsText);
    
        if (!invMaterialsText.length) materialEmbed.setDescription(comments.economy.inventory.noMaterials);
        if (!invObjectsText.length) objectEmbed.setDescription(comments.economy.inventory.noObjects);
    
        const filter = (i) => i.customId === `cake-i-${id}` && i.user.id === message.user.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 1_800_000 });
    
        collector.on('collect', async i => {
            if (i.values[0] === 'objects') {
                materialsOption.setDefault(false);
                objectOption.setDefault(true);
    
                await i.update({ 
                    embeds: [objectEmbed],
                    allowedMentions: { repliedUser: false }, 
                    components: [new ActionRowBuilder().addComponents(select)] 
                });
                
            } else {
                materialsOption.setDefault(true);
                objectOption.setDefault(false);
                
                await i.update({ 
                    embeds: [materialEmbed], 
                    allowedMentions: { repliedUser: false }, 
                    components: [new ActionRowBuilder().addComponents(select)] 
                });
            }
    
        });
    
        collector.on('end', () => client.collectors.set('active', id - 1));
    
        return message.reply({ embeds: [materialEmbed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(select)] });
        
    }
}