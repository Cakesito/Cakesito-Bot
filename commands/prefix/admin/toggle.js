
module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        
        let command = client.prefix_commands.get(args[0]);
        if (!command || command.ownerOnly) return message.reply('No encontré el comando `' + args[0] + '`');

        let status = await db.get(`n_${message.guild.id}_${command.name}`) || false;
        let newStatus = status == true ? false : true;

        await db.set(`n_${message.guild.id}_${command.name}`, newStatus);

        return message.reply('`' + command.name + '`:' + ` ${newStatus == true ? 'Desactivado' : 'Activado'}`);
    }
}
