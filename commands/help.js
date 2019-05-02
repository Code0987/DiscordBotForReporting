const main = require('../bot.js');
const Discord = require('discord.js');
const reporting = require('../utils/reporting.js');

exports.execute = (client, message, args) => {
  if (args.length == 1) {
    var title = `You have been helped!`;
    var msg = "Report format: -\n\n" + reporting.template() + "\n";

    if (client.config.REDIRECT_CHANNELS && client.config.REDIRECT_CHANNELS.length > 0) {
      msg += "\n";
      msg += "Redirection: ";
      for (const id of client.config.REDIRECT_CHANNELS)
        msg += `<#${id}> `;
      msg += "\n"
    }

    if (client.config.MONITOR_CHANNELS && client.config.MONITOR_CHANNELS.length > 0) {
      msg += "\n";
      msg += "Monitoring: ";
      for (const id of client.config.MONITOR_CHANNELS)
        msg += `<#${id}> `;
      msg += "\n"
    }

    if (client.config.IGNORE_CHANNELS && client.config.IGNORE_CHANNELS.length > 0) {
      msg += "\n";
      msg += "Ignoring: ";
      for (const id of client.config.IGNORE_CHANNELS)
        msg += `<#${id}> `;
      msg += "\n"
    }

    var embed = new Discord.RichEmbed()
      .setColor(9955331)
      .setTitle(title)
      .setDescription(msg);
    message.channel.send({ embed: embed });
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
