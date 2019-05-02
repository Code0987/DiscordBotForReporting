exports.config = {
  // Create an app at https://discordapp.com/developers/applications/
  // Get Client ID
  APP: "573246851256680450",

  // Create a bot
  // Get token
  TOKEN: "NTczMjQ2ODUxMjU2NjgwNDUw.XMoL6A._HS1nRZOHRFjopZnyES75QP7vm8",

  // Prefix for commands
  PREFIX: ".",

  // Channels to ignore
  IGNORE_CHANNELS: [
  ],

  // Destinations
  REDIRECT_CHANNELS: [
    "573256625910186004"
  ],

  // Sources
  MONITOR_CHANNELS: [
    "573255474359566336"
  ],

  // Mention roles
  REDIRECT_MENTION_ROLES: [
    "573510480564322306"
  ],

  // Mention text
  REDIRECT_MENTION_MSG: "There is a new report!",
  
  REPORT_WRONG_FORMAT_MSG: "Hey, you were trying to report something, but I require it in certain format to understand.",

  WELCOME_MESSAGE_CHANNEL: {
    // "Guild Id": "Channel Id"
  }
};
