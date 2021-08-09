const { SlashCommand, CommandOptionType } = require('slash-create');

class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'ping',
      description: 'Sends a test ping to the bot.',
      guildIDs: '621481304101355531',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'food',
          description: 'What food do you like?',
        },
      ],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx) {
    return `Hello, ${ctx.member.mention}! Pong!`;
  }
}

module.exports = HelloCommand;
