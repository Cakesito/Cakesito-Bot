
module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        const available = ['claim', 'craft', 'crime', 'daily', 'explore', 'work'];

        if (!available.includes(args[0])) return message.reply('El comando `' + args[0] + '` no existe o no se puede deshabilitar.');
        let status = await db.get(`n_${message.guild.id}_${command.name}`) || false;
        let newStatus = status == true ? false : true;

        await db.set(`n_${message.guild.id}_${command.name}`, newStatus);

        return message.reply('`' + command.name + '`:' + ` ${newStatus == true ? 'desactivado' : 'activado'}`);
    }
}
