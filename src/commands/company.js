import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config.json' with { type: "json" };

const data = new SlashCommandBuilder()
  .setName('company')
  .setDescription('Show company details.');

const execute = async (interaction, userData) => {
  const company = userData.company;
  let incomeMultiplier = 1;

  const upgrades = company.upgrades;
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

  const companyName = company?.name || 'Unknown';
  const companyLocation = company?.location || 'Unknown';
  const companyStaff = company?.staff || '0';
  const companyBank = company?.bank || '0';
  const companyIncome = company?.income || 'Unknown';

  const embed = new EmbedBuilder()
    .setTitle(company.name ? company.name : 'Unknown')
    .addFields([
      {
        name: 'Name',
        value: companyName,
        inline: true,
      },
      {
        name: 'Location',
        value: companyLocation,
        inline: true,
      },
      {
        name: 'Staff',
        value: companyStaff.toLocaleString(),
        inline: true,
      },
      {
        name: 'Bank',
        value: `$${companyBank.toLocaleString()}`,
        inline: true,
      },
      {
        name: 'Hourly Income',
        value: `$${
          companyIncome !== 'Unknown'
            ? (companyIncome * incomeMultiplier).toLocaleString()
            : 'Unknown'
        }`,
        inline: true,
      },
    ])
    .setThumbnail(interaction.client.user.avatarURL())
    .setColor('#e05644')
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
  });
};

export { data, execute };
