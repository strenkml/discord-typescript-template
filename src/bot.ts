import { Client, Collection, GatewayIntentBits } from "discord.js";

import Config from "./config/Config";

import ready from "./listeners/ready";
import messageCreate from "./listeners/messageCreate";
import interactionCreate from "./listeners/interactionCreate";
import errorHanding from "./listeners/errorHanding";

import Logger from "./util/Logger";

// Check if the config file exists
if (!Config.fileExists()) {
  Logger.error(
    "Config file not found! Rename src/config/sample.config.json to config.json and enter the required information!",
    "main"
  );
  process.exit(1);
}

// Create Discord.js client and set our intents
const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.slashCommands = new Collection();
client.textCommands = new Collection();

// Register our event handlers
errorHanding(client);
ready(client);
messageCreate(client);
interactionCreate(client);

// Use our token to connect to the connect
client.login(Config.getConfig().token);