const Discord = require('discord.js');

exports.execute = (client, message, args) => {
  var commands = "";

  client.commands.forEach(command => {
    commands += command.info.name + "\n";
  });

  var embed = new Discord.RichEmbed()
    .setColor(9955331)
    .addField("Commands", commands + "\n", false)

  message.channel.send(embed);
};

exports.info = {
  name: "commands",
  alias: ["cmds", "cmd", "c"],
  permission: "default",
  type: "general",
  guildOnly: false,
  help: "Print all commands"
};
