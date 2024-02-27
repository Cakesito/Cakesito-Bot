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

    data.data.forEach(item => options.addChoices({ name: item.name, value: item.name }));

    switch (command) {
        case 'craft':        
            options.setName('objeto')
            .setDescription('Nombre del objeto a crear');

            slashCommandData.setName('craft')
            .setDescription('Crea algo')
            .addStringOption(options)
            .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a crear'));
            break;

        case 'buy':
            options.setName('objeto')
            .setDescription('Nombre del objeto a comprar');

            slashCommandData.setName('buy')
            .setDescription('Compra algo en la tienda')
            .addStringOption(options)
            .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a comprar'));
            break;
    }

    await guild.commands.fetch();
    let guildCommand = guild.commands.cache.find(x => x.name === command);

    if (guildCommand) {
        guild.commands.edit(guildCommand.id, slashCommandData);
    } else {
        guild.commands.create([slashCommandData]);
    }

}

module.exports = { updateCommand };