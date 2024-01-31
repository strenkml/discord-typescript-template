import { CommandInteraction, PermissionsBitField } from "discord.js";

import SlashCommand from "../../models/SlashCommand";

export default class Example extends SlashCommand {
    constructor() {
    // Set the name and the descrption of the command
        super("example", "Example slash command");

        // Set additional configuration for the command if needed
        // In this case the command is disabled in DMs, only admins
        // can use the command, and there is a string option for the string to be returned to the caller
        this.data
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
            .addStringOption((option) => option.setName("text").setDescription("Text to be returned").setRequired(true));
    }

    async execute(interaction: CommandInteraction): Promise<void> {
    // Read in the option from the command and reply to the user with it
        let text = interaction.options.get("text")?.value;

        text = text == undefined ? "" : text.toString();

        interaction.reply(text);
    }
}
