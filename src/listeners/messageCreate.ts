import { Client, Message } from "discord.js";

import Config from "../config/Config";
import TextCommand from "../models/TextCommand";
import Logger from "stumper";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    Logger.debug("received message!");
    const prefix = Config.getConfig().prefix;

    // Ignores all bots
    if (message.author.bot) return;
    // Ignores all messages not in a text channel
    if (!message.channel.isTextBased()) return;
    // Ignores messages that dont start with the prefix
    if (!message.content.startsWith(prefix)) return;

    Logger.debug("received message after");

    const messageArray = message.content.split(" ");
    const command = messageArray[0];
    const args = messageArray.slice(1);

    const textCmd: TextCommand = message.client.textCommands.get(
      command.slice(prefix.length),
    );
    try {
      if (textCmd) {
        textCmd.execute(message, args);
        Logger.info(`Command ${command} called!`, "messageCreate");
      }
    } catch (err) {
      Logger.error(
        `Message content: ${message.content}  Error: ${err}`,
        "messageCreate",
      );
    }
  });
};
