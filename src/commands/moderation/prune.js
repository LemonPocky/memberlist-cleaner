'use strict';

const dayjs = require('dayjs');
const { Collection } = require('discord.js');

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
          description:
            "Prune members that haven't sent a message in this many days. (ex. 7)",
          required: true,
        },
      ],
    });
    this.client = creator.client;

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  // Run when the bot receives this slash command
  async run(ctx) {
    // Send a response confirming that the user wants this command run
    // This is called the initial response, since this is what responds to the slash command directly
    // Note: this confirmation shouldn't be used for every message, only sensitive ones like prune
    await ctx.send(
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
                custom_id: 'prune',
                label: 'Prune',
                style: ButtonStyle.DESTRUCTIVE,
              },
              // This is a grey button that reads "cancel"
              {
                type: ComponentType.BUTTON,
                custom_id: 'cancel',
                label: 'Cancel',
                style: ButtonStyle.SECONDARY,
              },
            ],
          },
        ],
      }
    );

    // We need to call fetch here so that the context knows what the messageID of its
    // initial response is
    await ctx.fetch();

    // Register the each component so that we do something when a button is clicked
    ctx.registerComponent('cancel', async (compCtx) => {
      // If the command was canceled, edit the message and remove the components from it
      await compCtx.editParent('Command canceled.', {
        components: [],
      });
    });
    ctx.registerComponent('prune', async (compCtx) => {
      // Send a reply so the interaction doesn't time out
      await compCtx.editParent(
        `Pruning all users with no messages in the last ${ctx.options.last_message_sent} days...`,
        {
          components: [],
        }
      );
      // Get the guild this command was run in
      const guild = await this.client.guilds.cache.get(ctx.guildID);
      // Refresh this guild's information
      await guild.fetch();
      // Get all members in the guild
      const guildMembers = await guild.members.fetch();
      // Get all channels in the guild
      const channels = await guild.channels.fetch();

      // Update message to let the user know of our progress
      const updateMessage = await channels
        .get(compCtx.channelID)
        .send('Searching for users to remove...');

      console.log(`Component called: ${compCtx.customID}`);

      // Keeps track of guild members who have posted recently (are safe)
      const seenGuildMembers = new Collection();
      // Messages older than this are out of scope, in unix timestamp milliseconds
      const expiration = dayjs()
        .subtract(ctx.options.last_message_sent, 'days')
        .valueOf();

      // Get all messages sent in the server in the last x number of days
      // We can only retrieve these in batches of 100, and we must go through each channel individually
      // Within each batch, iterate through each message and retrieve its author
      // Add the author to a collection of "valid" authors
      await Promise.all(
        channels.map(async (channel) => {
          // We only want to analyze text channels
          // If the bot doesn't have access to the channel for some reason, skip it
          if (channel.type !== 'GUILD_TEXT' || !channel.viewable) {
            return;
          }

          let pastExpiration = false;
          let lastMessageTimestamp = dayjs().valueOf();
          let lastMessageId;
          let totalMessages = 0;
          // While there are still more messages to fetch
          while (!pastExpiration) {
            // Fetch the next 100 messages from this channel
            const messages = await channel.messages.fetch({
              limit: 100,
              before: lastMessageId,
            });
            // If there are no more messages left, stop fetching
            if (!messages.size) {
              pastExpiration = true;
              break;
            }

            totalMessages += messages.size;
            // Iterate through each message and record its author
            messages.each((message) => {
              // If this message is too old, disregard it
              // We also can stop fetching messages from this channel
              if (message.createdTimestamp < expiration) {
                pastExpiration = true;
                return;
              }
              const authorId = message.author.id;
              // Add this user to our seen guild members (they are safe)
              seenGuildMembers.set(
                authorId,
                guildMembers.get(authorId).user.username
              );
              // Update the lastMessageTimestamp if we see an earlier message
              if (message.createdTimestamp < lastMessageTimestamp) {
                lastMessageTimestamp = message.createdTimestamp;
                lastMessageId = message.id;
              }
            });
          }
          console.log(`Channel name: ${channel.name}`);
          console.log(`Messages checked: ${totalMessages}`);
        })
      );

      // Find the guild members who have no already been seen
      const staleGuildMembers = guildMembers.difference(seenGuildMembers);

      // Kick members :devil:
      for await (const userID of staleGuildMembers.keys()) {
        console.log(userID);
      }

      console.log(`Prune is done.`);
    });
  }
}

module.exports = PruneCommand;
