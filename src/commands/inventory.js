import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View your inventory.');

const execute = async (interaction, userData) => {
  const inventoryEmbed = new EmbedBuilder()
    .setTitle('Inventory')
    .setColor('#e05644')
    .setTimestamp();

  if (!userData.inventory) {
    inventoryEmbed.setDescription('You have no items in your inventory.');
  } else {
    Object.keys(userData.inventory).forEach((index, value) => {
      inventoryEmbed.addFields({
        name: `${value + 1}. ${index}`,
        value: userData.inventory[index].toLocaleString(),
      });
    });
  }

  await interaction.reply({ embeds: [inventoryEmbed] });
};

export { data, execute };
