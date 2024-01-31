import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default abstract class SlashCommand {
    // Contains the behavior of the command
    readonly data: SlashCommandBuilder;

    // The command
    // Ex: "test" would make the command /test
    name: string;

    // A desciption of the command
    description: string;

    constructor(name: string, description: string) {
    // Must be lowercase
        this.name = name.toLowerCase();
        this.description = description;

        // If additional configuration is needed, it can be added in the constructor of the command
        // See the example slash command (src/commands/slash/example.ts)
        this.data = new SlashCommandBuilder().setName(this.name).setDescription(this.description);
    }

  // Called when the command is triggered
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
