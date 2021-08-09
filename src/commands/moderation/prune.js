const {
  SlashCommand,
  CommandOptionType,
  ComponentType,
  ButtonStyle,
} = require('slash-create');

class PruneCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'prune',
      description: 'Mass kick members from the server.',
      guildIDs: '621481304101355531',
      // Permissions required to execute this command
      // Should be an array of these strings:
      // https://github.com/Snazzah/slash-create/blob/141597e1d8da313d3af5a27155da4a962f568e1c/src/structures/permissions.ts#L43
      requiredPermissions: ['ADMINISTRATOR'],
      // Options, otherwise known as subcommands, are parameters passed into the main command
      // They can be made required or optional
      options: [
        {
          type: CommandOptionType.INTEGER,
          name: 'last_message_sent',
          description: `Prune members that haven't sent a message in this many days. (ex. 7)`,
          required: true,
        },
      ],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  // Run when the bot receives this slash command
  async run(ctx) {
    // Send a response confirming that the user wants this command run
    // This is called the initial response, since this is what responds to the slash command directly
    // Note: this confirmation shouldn't be used for every message, only sensitive ones like prune
    ctx.send(
      // We can get the values the user has passed into suboptions by using ctx.options
      `Are you sure you wish to run this command? This will remove all users who have not sent
any messages in the last ${ctx.options.last_message_sent} days!`,
      {
        // Components are interactive elements, such as buttons or dropdowns
        components: [
          // Each element in this array can either be a Component or an Action Row
          // We can use Action Rows to group Components together
          {
            type: ComponentType.ACTION_ROW,
            components: [
              // This is a red button that reads "prune"
              {
                type: ComponentType.BUTTON,
                custom_id: `prune`,
                label: `Prune`,
                style: ButtonStyle.DESTRUCTIVE,
              },
              // This is a grey button that reads "cancel"
              {
                type: ComponentType.BUTTON,
                custom_id: `cancel`,
                label: `Cancel`,
                style: ButtonStyle.SECONDARY,
              },
            ],
          },
        ],
      }
    );
  }
}

module.exports = PruneCommand;
