const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');

let convertion = {
    'craft.items': 'craft',
    'shop.items': 'buy'
}

async function updateCommand (data, guild) {
    const command = convertion[data.setting];
        
    let slashCommandData = new SlashCommandBuilder()

    let options = new SlashCommandStringOption()
    .setRequired(true);
    
    let toUpdate = [];
    
    switch (command) {
        case 'craft':
            data.data.forEach(item => options.addChoices({ name: item.name, value: '' + item.id }));

            options.setName('objeto')
            .setDescription('Nombre del objeto a crear')
            .setDescriptionLocalizations({
                "en-GB": "Name of the object to craft",
                "en-US": "Name of the object to craft"
            });

            slashCommandData.setName('craft')
            .setDescription('Crea algo')
            .setDescriptionLocalizations({
                "en-GB": "Craft an object",
                "en-US": "Craft an object"
            })
            .addStringOption(options)
            .addIntegerOption(option => 
                option.setName('cantidad')
                .setDescription('Cantidad a crear')
                .setDescriptionLocalizations({
                    "en-GB": "Amount to be crafted",
                    "en-US": "Amount to be crafted"
                })
            );

            toUpdate.push({ name: 'craft', data: slashCommandData, delete: options.choices ? false : true });

            
            var useOptions = new SlashCommandStringOption()
                .setName('objeto')
                .setDescription('Nombre del objeto a usar')
                .setDescriptionLocalizations({
                    "en-GB": "Name of the object to be used",
                    "en-US": "Name of the object to be used"
                })
                .setRequired(true);
                
            data.data.forEach(item => {
                if (item.use?.type) useOptions.addChoices({ name: item.name, value: '' + item.id });
            });

            let useCommand = new SlashCommandBuilder()
                .setName('use')
                .setDescription('Usa un objeto')
                .setDescriptionLocalizations({
                    "en-GB": "Use an object",
                    "en-US": "Use an object"
                })
                .addStringOption(useOptions)
                .addIntegerOption(option => 
                    option.setName('cantidad')
                    .setDescription('Cantidad de objetos a usar')
                    .setDescriptionLocalizations({
                        "en-GB": "Amount of objects to be used",
                        "en-US": "Amount of objects to be used"
                    })
                );
            
            toUpdate.push({ name: 'use', data: useCommand, delete: useOptions.choices ? false : true });

            break;

        case 'buy':
            data.data.forEach(item => options.addChoices({ name: item.name, value: '' + item.name }));

            options.setName('objeto')
            .setDescription('Nombre del objeto a comprar')
            .setDescriptionLocalizations({
                "en-GB": "Name of the item to buy",
                "en-US": "Name of the item to buy"
            });

            slashCommandData.setName('buy')
            .setDescription('Compra algo en la tienda')
            .setDescriptionLocalizations({
                "en-GB": "Buy in the server's shop",
                "en-US": "Buy in the server's shop"
            })
            .addStringOption(options)
            .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a comprar'));

            toUpdate.push({ name: 'buy', data: slashCommandData, delete: options.choices ? false : true });
            break;

        default: throw new Error();
    }
    
    await guild.commands.fetch();
    for (var cmd of toUpdate) await update(cmd.name, cmd.data, cmd.delete);

    async function update(name, data, remove) {
        var guildCommand = guild.commands.cache.find(x => x.name === name);
        
        if (guildCommand) {
            if (remove) return await guild.commands.delete(guildCommand.id);
            await guild.commands.edit(guildCommand.id, data);
        } else {
            await guild.commands.create(data);
        }
    }
}

module.exports = { updateCommand };