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
            .setDescription('Nombre del objeto a crear');

            slashCommandData.setName('craft')
            .setDescription('Crea algo')
            .addStringOption(options)
            .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a crear'));

            toUpdate.push({ name: 'craft', data: slashCommandData, delete: options.choices ? false : true });

            
            var useOptions = new SlashCommandStringOption()
                .setName('objeto')
                .setDescription('Nombre del objeto a usar')
                .setRequired(true);
                
            data.data.forEach(item => {
                if (item.use?.type) useOptions.addChoices({ name: item.name, value: '' + item.id });
            });

            let useCommand = new SlashCommandBuilder()
                .setName('use')
                .setDescription('Usa un objeto')
                .addStringOption(useOptions)
                .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad de objetos a usar'));
            
            toUpdate.push({ name: 'use', data: useCommand, delete: useOptions.choices ? false : true });

            break;

        case 'buy':
            data.data.forEach(item => options.addChoices({ name: item.name, value: '' + item.name }));

            options.setName('objeto')
            .setDescription('Nombre del objeto a comprar');

            slashCommandData.setName('buy')
            .setDescription('Compra algo en la tienda')
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