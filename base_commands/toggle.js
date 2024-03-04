const fix = require('./util/fix');

module.exports = async (message, db, data = { command }) => {
    message = fix(message);
    
    const available = ['claim', 'craft', 'crime', 'daily', 'explore', 'work'];

    if (!available.includes(data.command)) return message.reply('El comando `' + data.command+ '` no existe o no se puede deshabilitar.');
    let status = await db.get(`n_${message.guild.id}_${data.command}`) || false;
    let newStatus = status == true ? false : true;

    await db.set(`n_${message.guild.id}_${data.command}`, newStatus);

    return message.reply('`' + data.command + '`:' + ` ${newStatus == true ? 'desactivado' : 'activado'}`);
}