const Discord = require('discord.js');

var report_format =
  "Reported Player Name: (Required)"
  + "\nSteam ID of Reported Player: (Optional)"
  + "\nOffense: (Required)"
  + "\nYour Steam Name: (Required)"
  + "\nYour Steam ID: (Required)"
  + "\nSummary & Details: (Optional)";

exports.template = () => { return report_format };

var re_report_format = new RegExp(
  "(\\bReported Player Name\\b:(.*))"
  + "(\\n\\bSteam ID of Reported Player\\b:(.*))?"
  + "(\\n\\bOffense\\b:(.*))"
  + "(\\n\\bYour Steam Name\\b:(.*))"
  + "(\\n\\bYour Steam ID\\b:(.*))"
  + "(\\n\\bSummary & Details\\b:(.*))?"
  , "gim");

exports.valid = (text) => {
  return re_report_format.test(text);
};

exports.valid2 = (text) => {
  re_report_format.lastIndex = 0;

  var groups = re_report_format.exec(text);

  var reported = groups[2].trim();
  var reportedId = groups[4].trim();
  var offence = groups[6].trim();
  var reporter = groups[8].trim();
  var reporterId = groups[10].trim();
  var details = groups[12].trim();

  if (
    !reported || reported.length == 0
    ||
    !offence || offence.length == 0
    ||
    !reporter || reporter.length == 0
    ||
    !reporterId || reporterId.length == 0
    ||
    !details || details.length == 0
  ) {
    return false;
  }

  return true;
};

exports.format = (text, caseno, author) => {
  re_report_format.lastIndex = 0;

  var groups = re_report_format.exec(text);

  var reported = groups[2].trim();
  var reportedId = groups[4].trim();
  var offence = groups[6].trim();
  var reporter = groups[8].trim();
  var reporterId = groups[10].trim();
  var details = groups[12].trim();

  if (
    !reported || reported.length == 0
    ||
    !offence || offence.length == 0
    ||
    !reporter || reporter.length == 0
    ||
    !reporterId || reporterId.length == 0
    ||
    !details || details.length == 0
  ) {
    return null;
  }

  const embed = {
    "description": `Report Case #${caseno}`,
    "color": 4886754,
    "timestamp": (new Date()).toUTCString(),
    "author": {
      "name": "Players Reports",
      "icon_url": "https://i.imgur.com/b50CMk0.png"
    },
    "fields": [
      {
        "name": "-",
        "value": "-",
        "inline": false
      },
      {
        "name": "Reported Player",
        "value": reported,
        "inline": true
      },
      {
        "name": "Steam ID",
        "value": "[" + reportedId + "](https://steamcommunity.com/id/" + reportedId + ")",
        "inline": true
      },
      {
        "name": "Offense",
        "value": offence,
        "inline": true
      },
      {
        "name": "Reporter",
        "value": reporter,
        "inline": true
      },
      {
        "name": "Steam ID",
        "value": "[" + reporterId + "](https://steamcommunity.com/id/" + reporterId + ")",
        "inline": true
      },
      {
        "name": "Reporter Discord",
        "value": `${author.username}#${author.discriminator}`,
        "inline": true
      },
      {
        "name": "-",
        "value": "-",
        "inline": false
      },
      {
        "name": "Summary & Details",
        "value": details,
        "inline": true
      }
    ]
  };

  return {
    embed: new Discord.RichEmbed(embed)
  };
};

exports.getMentions = (client, guild) => {
  var selected = guild.members;

  selected = selected.filter(x => !x.bot && x.presence.status === 'online');
  selected = selected.filter(x => x.roles.map(r => r.id).some(v => client.config.REDIRECT_MENTION_ROLES.indexOf(v) !== -1));

  var mentions = "";

  if (selected) {
    for (const v of selected.map(x => x.user.toString())) {
      mentions = mentions + v + " ";
    }

    mentions = mentions.trim();

    if (mentions.length > 1)
      mentions = `${mentions} ${client.config.REDIRECT_MENTION_MSG}`;
    else
      mentions = null;
  }

  return mentions;
};
