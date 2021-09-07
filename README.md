# Memberlist Cleaner
Remove members from a Discord server based on the time since their last message.

## Intro
Discord currently has a [prune](https://support.discord.com/hc/en-us/articles/213507137-What-is-Pruning-How-do-I-use-it-) feature. I found this to be insufficient because it kicks members based on last online activity, which doesn't take user participation in a server into account. This bot aims to solve that issue by kicking users based on the time since their last message was sent in the server, rather than last online activity.

Note: This bot is incomplete; full usage instructions will be added when the bot works.

Planned features:
- Mass kick members from a Discord server based on:
  - Last message sent

Due to Discord's rate limits, this bot can only kick 1 user per second, which could lead to several hours of runtime for large servers. Use with caution.

Most of the code is in [prune.js](https://github.com/LemonPocky/memberlist-cleaner/blob/main/src/commands/moderation/prune.js).
