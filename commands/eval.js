
const clean = async (text) => {
    
    if (text && text.constructor.name == "Promise")
      text = await text;
    
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });
    
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    
    return text;
}

module.exports = {
    ownerOnly: true,
    run: async (client, message, args) => {

        try {
            const evaled = eval(args.join(' '));
            const cleaned = await clean(evaled);

            message.reply(`\`\`\`js\n${cleaned}\n\`\`\``);
        } catch (err) {
            // message.reply(`\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``);
            console.error(err)
        }
    }
}