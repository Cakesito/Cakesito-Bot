const { AttachmentBuilder } = require('discord.js');

module.exports = {
    onlyOwner: true,
    runPrefix: (client, comments, message, args) => module.exports.run(client, comments, message, args),
    
    run: async (client, comments, message, args) => {

      const clean = async (text) => {
    
        if (text && text.constructor.name == "Promise") text = await text;
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
        
        text = text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .replace(new RegExp(client.token, 'gi'), 'xd');
        
        return text;
      }

      const db = client.db;
      const msg = message;

      let code = args.join(' ');
      let evaled;

      try {

        evaled = eval(code);
        if (evaled instanceof Promise) evaled = await evaled;

        evaled = await clean(evaled);
        res = `\`\`\`js\n${evaled}\n\`\`\``;

        if (res.length < 2000) {
          await msg.channel.send(res);

        } else {
          const output = new AttachmentBuilder(Buffer.from(res), { name: 'output.txt' });
          await msg.channel.send({ files: [output] });
        }

      } catch (err) {
        err = await clean(err);
        return message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
      }

  }
}