const Discord = require('discord.js');
const fs = require('fs');
const cfg = require('./config.js');
const storage = require('node-persist');
const reporting = require('./utils/reporting.js');

///////////////////////////////////////////////////////////////////////////////

// Init

const client = new Discord.Client();

// Config and storage

storage.initSync({ dir: "data" });

client.config = {
  TOKEN: cfg.config.TOKEN,
  APP: cfg.config.APP,
  PREFIX: cfg.config.PREFIX,
  IGNORE_CHANNELS: cfg.config.IGNORE_CHANNELS,
  REDIRECT_CHANNELS: cfg.config.REDIRECT_CHANNELS,
  MONITOR_CHANNELS: cfg.config.MONITOR_CHANNELS,
  REDIRECT_MENTION_ROLES: cfg.config.REDIRECT_MENTION_ROLES,
  REDIRECT_MENTION_MSG: cfg.config.REDIRECT_MENTION_MSG,
  REPORT_WRONG_FORMAT_MSG: cfg.config.REPORT_WRONG_FORMAT_MSG,
  WELCOME_MESSAGE_CHANNEL: cfg.config.WELCOME_MESSAGE_CHANNEL
};

exports.config = () => {
  return client.config;
}

exports.commands = () => {
  return client.commands;
}

// Commands

client.commands = [];
fs.readdir("./commands/", function (err, files) {
  files.forEach(f => {
    const cmd = require(`./commands/${f}`);
    client.commands.push(cmd);
  });
});

///////////////////////////////////////////////////////////////////////////////

// Crashes and errors

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});

client.on("error", (err) => console.error(err));

client.on('disconnect', async () => {
  console.warn("Bot disconnected!");

  client.destroy();
  client.login(client.config.TOKEN);
});

client.on("ready", () => {
  console.info(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

  client.user.setActivity(client.config.PREFIX + "help");
});

// Members

client.on("guildMemberAdd", member => {
  var guild = member.guild;
  var channelToSend = null;

  // if guild has a specified channel to use for welcome message
  if (guild.id in client.config.WELCOME_MESSAGE_CHANNEL) {
    var channelId = client.config.WELCOME_MESSAGE_CHANNEL[guild.id];
    channelToSend = guild.channels.get(channelId);
  }
  // otherwise use the first channel where the bot can send messages
  else {
    channelToSend = guild.channels.filter(c => c.type === "text"
      && c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
      .sort((a, b) => a.position - b.position
        || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
      .first();
  }
  channelToSend.send(`Welcome ${member.displayName}!`);
});

client.on("guildMemberRemove", member => {
  var guild = member.guild;
  var channelToSend = null;

  // if guild has a specified channel to use for welcome (and goodbye) messages
  if (guild.id in client.config.WELCOME_MESSAGE_CHANNEL) {
    var channelId = client.config.WELCOME_MESSAGE_CHANNEL[guild.id];
    channelToSend = guild.channels.get(channelId);
  }
  // otherwise use the first channel where the bot can send messages
  else {
    channelToSend = guild.channels.filter(c => c.type === "text"
      && c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
      .sort((a, b) => a.position - b.position
        || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
      .first();
  }

  channelToSend.send(`${member.displayName} has left us.`);
});

// Messages

client.on("message", msg => {
  // avoid spam channels
  if (client.config.IGNORE_CHANNELS.includes(msg.channel.id)) return;

  // log all messages read (not saved)
  var u = msg.author.username;
  var c = msg.channel.name;
  if (c == undefined) c = "private";

  // Extract message content
  var m = msg.content;
  msg.embeds.forEach(value => {
    if (value.type == "rich") {
      m = value.description;
    }
  });

  console.debug("[" + c + "] " + u + ": " + m);

  // process commands
  if (m && m.startsWith(client.config.PREFIX)) {
    var args = m.substring(client.config.PREFIX.length).split(" ");
    var cmdName = args[0].toLowerCase();

    client.commands.forEach(command => {
      if (cmdName === command.info.name || command.info.alias.includes(cmdName)) {
        // guild or private chat check
        if (command.info.guildOnly && msg.channel.type === 'dm') {
          msg.channel.send("This command unavailable in private chat :^(");
          return;
        }

        // admin check
        if (command.info.permission == "admin"
          && msg.author.id != client.config.APP) {
          msg.channel.send("Admin only command :^)");
        } else {
          command.execute(client, msg, args);
        }
      }
    });

    // delete message
    if (client.config.MONITOR_CHANNELS.includes(msg.channel.id) && !msg.author.bot)
      msg.delete();
  }

  // process redirections
  else if (m && client.config.MONITOR_CHANNELS.includes(msg.channel.id)) {

    if (reporting.valid(m)) {

      if (reporting.valid2(m)) {

        client.config.REDIRECT_CHANNELS.forEach(id => {
          var redirectChannel = client.channels.get(id);

          if (redirectChannel == null) {
            console.warn("Could not redirect from channel ID " + msg.channel.id + " to channel ID "
              + redirectChannel + ": Destination channel was not found.");
            return;
          } else if (!(redirectChannel instanceof Discord.TextChannel)) {
            console.warn("Could not redirect from channel ID " + msg.channel.id + " to channel ID "
              + redirectChannel + ": Destination channel is not a text channel.");
            return;
          }

          console.info("Redirecting message by " + msg.author.username
            + " from " + msg.guild.name + "/" + msg.channel.name
            + " to " + redirectChannel.guild.name + "/" + redirectChannel.name
          );

          var caseno = (storage.getItemSync("caseno") || 0) + 1;
          var mentions = reporting.getMentions(client, msg.guild);
          var report = reporting.format(m, caseno, msg.author);

          if (mentions)
            redirectChannel.send(mentions);
          if (report)
            redirectChannel.send(report);

          storage.setItemSync("caseno", caseno);
        });

      } else {

        msg.author.send(client.config.REPORT_WRONG_FORMAT_MSG);
        msg.author.send(reporting.template());

      }

    }

    // delete message
    if (!msg.author.bot)
      msg.delete();
  }

});

///////////////////////////////////////////////////////////////////////////////

// Start

client.login(client.config.TOKEN);
