
module.exports = {
    memberPermissions: ['MANAGE_SERVER'],
    run: async (client, message, args) => {
        const db = client.db.get('db');
        
        let command = client.commands.get(args[0]);

        let status = await db.get(`n_${command.name}`) || false;
        let newStatus = status == true ? false : true;

        await db.set(`n_${command.name}`, newStatus);

        return message.reply(`(${newStatus == true ? 'no' : 'yes'}) ok: ${command.name}`);
    }
}
