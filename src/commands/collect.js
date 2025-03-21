import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import { saveData, validate } from 'storelite2';
import config from '../../config.json' with { type: "json" };
import createErrorEmbed from '../utils/createErrorEmbed.js';

const data = new SlashCommandBuilder()
  .setName('collect')
  .setDescription('Claim your idle earnings.');

const execute = async (interaction, userData) => {
  const company = userData.company;
  const upgrades = company.upgrades;
  const date = new Date().getTime();

  let totalTime = 0;
  let totalEarnings = 0;
  let incomeMultiplier = 1;

  try {
    if (upgrades) {
      Object.keys(upgrades).forEach((upgradeKey) => {
        const upgrade = config.base_upgrades[upgradeKey];
        const upgradeLevel = company.upgrades[upgradeKey]
          ? company.upgrades[upgradeKey]
          : 0;

        incomeMultiplier += upgrade.incomeMultiplier * upgradeLevel;
      });
    }

    const staff = company.staff;
    if (staff) incomeMultiplier += config.staff_upgrades.incomeMultiplier * staff;
    
    totalTime = Math.floor(Math.abs(company.lastCollection - date) / 60_000);
    totalEarnings = Math.floor(
      (company.income / 60) * totalTime * incomeMultiplier
    );

    if (totalTime <= 5 || totalEarnings <= 5)
      return interaction.reply({
        embeds: [createErrorEmbed('You have no earnings to collect.')],
        flags: MessageFlags.Ephemeral,
      });

    company.bank += totalEarnings;
    company.lastCollection = date;
  } catch (error) {
    console.error(
      'An error occured while calculating the users earnings:',
      error
    );

    return interaction.reply({
      embeds: [
        createErrorEmbed('An error occured while calculating your earnings.'),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    validate(userData);
    await saveData(userData);
  } catch (error) {
    console.error('Error saving data:', error);

    return interaction.reply({
      embeds: [createErrorEmbed('An error occured while saving your data.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const collectionEmbed = new EmbedBuilder()
    .setTitle('Collect')
    .setDescription(
      `You were away for **${
        totalTime >= 60 ? `${(totalTime / 60).toFixed(1)}h` : `${totalTime}m`
      }** and have collected **$${totalEarnings.toLocaleString()}**.\nCome back in 5m to collect again.`
    )
    .setThumbnail(interaction.client.user.avatarURL())
    .setColor('#e05644')
    .setTimestamp();

  await interaction.reply({
    embeds: [collectionEmbed],
  });
};

export { data, execute };
