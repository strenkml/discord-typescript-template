import SlashCommand from "../../models/SlashCommand";

export {};

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
  }
}
