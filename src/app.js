// Reads environment variables from .env and stores them in process.env
require('dotenv').config();

// Reads commands from the "commands" directory and automatically
// sets them up as Discord slash commands
const { SlashCreator, GatewayServer } = require('slash-create');

// Package for interacting with Discord's API
const { Client, Intents } = require('discord.js');

const path = require('path');

const botIntents = new Intents();
botIntents.add(Intents.FLAGS.GUILD_MEMBERS);

const client = new Client({ intents: botIntents });

// Set up slash commands
const creator = new SlashCreator({
  applicationID: process.env.DISCORD_APPLICATION_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  token: process.env.DISCORD_TOKEN,
});

console.log('Starting creator...');

creator.on('commandRegister', (command, cmdCreator) => {
  console.log(`Registered command: ${command.commandName}`);
});
creator.on('commandRun', (command, result, ctx) => {
  console.log(`Command called: ${command.commandName}`);
});

creator.client = client;

creator
  .withServer(
    new GatewayServer((handler) => client.ws.on('INTERACTION_CREATE', handler))
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands();

console.log('Logging in to Discord...');
client.login(process.env.DISCORD_TOKEN);
