const main = require('../bot.js');
const Discord = require('discord.js');

exports.execute = (client, message, args) => {
  if (args.length == 1) {
    var title = `You have been helped!`;
    var msg = "List all commands: `.commands`\n";
    msg += "Info about a command: `.help <command>`";

    var embed = new Discord.RichEmbed()
      .setColor(9955331)
      .setTitle(title)
      .setDescription(msg);
    message.channel.send(embed);
  } else {
    var cmdName = args[1];
    main.commands().forEach(command => {
      if (cmdName === command.info.name || command.info.alias.includes(cmdName)) {
        var embed = new Discord.RichEmbed()
          .setColor(9955331)
          .setTitle(`${command.info.name}`)
          .setDescription(`${command.info.help}`);
        message.channel.send(embed);
        return;
      }
    });
  }
};

exports.info = {
  name: "help",
  alias: [],
  permission: "default",
  type: "general",
  guildOnly: false,
  help: "Print help message"
};
