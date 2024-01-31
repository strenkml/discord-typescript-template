import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord-api-types/v9";
import fs from "fs";

import Config from "../config/Config";
import Logger from "stumper";
import SlashCommand from "../models/SlashCommand";
import TextCommand from "../models/TextCommand";

export default (client: Client): void => {
  client.on("ready", async () => {
    const slashCommands = readSlashCommands(client);
    readTextCommands(client);

    const rest = new REST({ version: "9" }).setToken(Config.getConfig().token);
    Logger.info("Bot Online!", "clientReady");
    Logger.info("Registering guild slash commands", "clientReady");

    if (client.user) {
      // If the bot is in production mode register the commands globally (changes will take longer to appear)
      if (Config.isProductionMode()) {
        rest
          .put(Routes.applicationCommands(client.user.id), {
            body: slashCommands,
          })
          .then(() =>
            Logger.info(
              "Successfully registered application commands for development guild.",
              "clientReady",
            ),
          )
          .catch((err) => {
            Logger.error(
              `Error registering application commands for development guild: ${err}`,
              "clientReady",
            );
          });
      } else {
        // If the bot is in non production mode register the commands to the testing guild (changes will appear immediately)
        const guildId = Config.getConfig().guildId;
        if (guildId) {
          rest
            .put(Routes.applicationGuildCommands(client.user.id, guildId), {
              body: slashCommands,
            })
            .then(() =>
              Logger.info(
                "Successfully registered application commands for production.",
                "clientReady",
              ),
            )
            .catch((err) => {
              Logger.error(
                `Error registering application commands for production: ${err}`,
                "clientReady",
              );
            });
        } else {
          Logger.error(
            "Guild id missing from non production config",
            "clientReady",
          );
        }
      }
    }
  });
};

async function readSlashCommands(
  client: Client,
): Promise<Array<RESTPostAPIChatInputApplicationCommandsJSONBody>> {
  const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

  const commandFiles = fs
    .readdirSync(`${__dirname}/../commands/slash`)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    Logger.info(`Loading slash command: ${file}`, "clientReady");
    const Command = await import(`../commands/slash/${file}`);
    const command: SlashCommand = new Command.default();
    commands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  }

  Logger.info(
    `Successfully loaded ${commands.length} slash commands!`,
    "clientReady",
  );
  return commands;
}

async function readTextCommands(client: Client): Promise<void> {
  const commandFiles = fs
    .readdirSync(`${__dirname}/../commands/text`)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    Logger.info(`Loading text command: ${file}`, "clientReady");
    const Command = await import(`../commands/text/${file}`);
    const command: TextCommand = new Command.default();
    client.textCommands.set(command.command, command);
  }

  Logger.info(
    `Successfully loaded ${client.textCommands.length} text commands!`,
    "clientReady",
  );
}
