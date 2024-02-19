const { MessageAttachment } = require('discord.js');

module.exports = {
    ownerOnly: true,
    run: async (client, message, args) => {

      const clean = async (text) => {
    
        if (text && text.constructor.name == "Promise") text = await text;
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
        
        text = text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .replace(new RegExp(client.token, 'gi'), '****');
        
        return text;
      }

      const db = client.db.get('db');

      const msg = message;

      let code = args.join(' ');
      let evaled;

      try {

        evaled = await eval(code);
        if (evaled instanceof Promise) evaled = await evaled;

        evaled = await clean(evaled);
        res = `\`\`\`js\n${evaled}\n\`\`\``;

        if (res.length < 2000) {
          await msg.channel.send(res);

        } else {
          const output = new MessageAttachment(Buffer.from(res), 'output.txt');
          await msg.channel.send(output)
        }

      } catch (err) {
        err = await clean(err);
        return message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
      }

  }
}