const Discord = require('discord.js');
const request = require('sync-request');

var report_fields = {
  "Reported Player Name": true,
  "Steam ID of Reported Player": false,
  "Offense": true,
  "Your Steam Name": true,
  "Your Steam ID": true,
  "Summary & Details": false
};

var getReportExample = exports.getReportExample = () => {
  var r = "";

  for (const key in report_fields) {
    r += `${key}: ${report_fields[key] ? '(Required)' : '(Optional)'}\n`;
  }

  // Remove last \n
  r = r.trim();

  return r;
};

var getReportRegEx = exports.getReportRegEx = () => {
  var r = "";

  for (const key in report_fields) {
    r += `(\\n?(\\b${key}\\b):(.*))${report_fields[key] ? '' : '?'}`;
  }

  return new RegExp(r, "gim");
};

exports.validReport = (text) => {
  var re = getReportRegEx();
  re.lastIndex = 0;

  var isit = re.test(text);

  return isit;
};

exports.validReport2 = (text) => {
  var r = true;

  // Extract keys and values
  var re = getReportRegEx();
  re.lastIndex = 0;
  var groups = re.exec(text);

  // Check each key
  for (const key in report_fields) {

    var required = report_fields[key];
    if (required) {

      // Check if key is present
      var index = groups.indexOf(key);
      if (index > -1) {

        // Check if its not empty
        var value = groups[index + 1];
        if (!(value && value.length > 0 && value.trim().length > 0)) {
          r = false;
          break;
        }

      }
      // Not found, so stop and fail
      else {
        r = false;
        break;
      }

    }

  }

  return r;
};

var resolveSteamId64 = exports.resolveSteamId64 = (input, def) => {
  try {
    if (!input || input.length < 2 || input === def)
      return input;

    var res = request('GET', `https://steamid.io/lookup/${encodeURI(input)}`, {
      timeout: 3000 // ms
    });

    var body = res.getBody("utf-8");

    var r = body.match(/\d{17}/g);

    return r[0];
  } catch (e) {
    // console.warn(e);
    return input;
  }
}

exports.format = (text, caseno, author) => {
  // Extract keys and values
  var re = getReportRegEx();
  re.lastIndex = 0;
  var groups = re.exec(text);

  /*
  for (var i = 0; i < groups.length; i++) {
    console.log(`${i}: ${groups[i]}`);
  }
  */

  var missing = "Missing";

  var reported = (groups[3] || missing).trim();
  var reportedId = (groups[6] || missing).trim();
  var offence = (groups[9] || missing).trim();
  var reporter = (groups[12] || missing).trim();
  var reporterId = (groups[15] || missing).trim();
  var details = (groups[18] || missing).trim();

  reportedId = resolveSteamId64(reportedId, missing);
  reporterId = resolveSteamId64(reporterId, missing);

  /*
  console.log(reported);
  console.log(reportedId);
  console.log(offence);
  console.log(reporter);
  console.log(reporterId);
  console.log(details);
  */

  // Prepare embed
  const embed = {
    "description": `Report Case \`#${caseno}\``,
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
        "value": `${reported}`,
        "inline": true
      },
      {
        "name": "Steam ID",
        "value": "[" + reportedId + "](https://steamcommunity.com/profiles/" + reportedId + ")",
        "inline": true
      },
      {
        "name": "Offense",
        "value": `${offence}`,
        "inline": true
      },
      {
        "name": "Reporter",
        "value": `${reporter}`,
        "inline": true
      },
      {
        "name": "Steam ID",
        "value": "[" + reporterId + "](https://steamcommunity.com/profiles/" + reporterId + ")",
        "inline": true
      },
      {
        "name": "Reporter Discord",
        "value": `${author.toString()}`,
        "inline": true
      },
      {
        "name": "-",
        "value": "-",
        "inline": false
      },
      {
        "name": "Summary & Details",
        "value": `${details}`,
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
