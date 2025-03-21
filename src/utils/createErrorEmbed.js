import { EmbedBuilder } from 'discord.js';

const createErrorEmbed = (message) =>
  new EmbedBuilder().setDescription(`**${message}**`).setColor('#e05644');

export default createErrorEmbed;
