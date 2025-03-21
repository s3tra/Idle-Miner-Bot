import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { saveData, validate } from 'storelite2';
import createErrorEmbed from '../utils/createErrorEmbed.js';
import createMessageComponentCollector from '../utils/messageComponentCollector.js';
import baseUpgrades from '../../config.json' with { type: "json" };

const data = new SlashCommandBuilder()
  .setName('upgrade')
  .setDescription('Level up your company.');

const generateProgressBar = (cur, max) => {
  let bar = '';

  for (let i = 0; i < cur; i++) bar += '🟦';
  for (let i = cur; i < max; i++) bar += '⬜';

  return bar;
};

const execute = async (interaction, userData) => {
  const company = userData.company;

  if (!company.upgrades) company.upgrades = { staff_efficiency: 0 };

  const upgradeEmbed = new EmbedBuilder()
    .setTitle('Upgrade')
    .setDescription('Enhance various aspects of your company.')
    .setColor('#e05644')
    .setTimestamp();

  Object.keys(baseUpgrades).forEach((upgradeKey) => {
    const upgrade = baseUpgrades[upgradeKey];
    const upgradeLevel = company.upgrades[upgradeKey]
      ? company.upgrades[upgradeKey]
      : 0;

    upgradeEmbed.addFields({
      name: `${upgrade.name} (${upgradeLevel}/${upgrade.maxUpgrade})`,
      value: generateProgressBar(upgradeLevel, upgrade.maxUpgrade),
    });
  });

  const row = new ActionRowBuilder();

  Object.keys(baseUpgrades).forEach((upgradeKey) => {
    const upgrade = baseUpgrades[upgradeKey];

    row.addComponents(
      new ButtonBuilder()
        .setLabel(upgrade.name)
        .setCustomId(upgradeKey)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const upgradeInteraction = await interaction.reply({
    embeds: [upgradeEmbed],
    components: [row],
    fetchReply: true,
  });

  try {
    const i = await createMessageComponentCollector(
      interaction,
      upgradeInteraction,
      (i) => i.user.id === interaction.user.id
    );

    if (company.upgrades[i.customId] === baseUpgrades[i.customId].maxUpgrade)
      return i.reply({
        content: 'This item is already at the maximum upgrade level.',
        flags: MessageFlags.Ephemeral,
      });

    const upgradeCost =
      baseUpgrades[i.customId].basePrice * (company.upgrades[i.customId] + 1);
    if (company.bank < upgradeCost)
      return i.reply({
        content: `You need $${upgradeCost} to purchase this.`,
        flags: MessageFlags.Ephemeral,
      });

    company.bank -= upgradeCost;
    company.upgrades[i.customId] += 1;

    try {
      validate(userData);
      await saveData(userData);
    } catch (error) {
      console.error('Error saving data:', error);

      return i.reply({
        embeds: [createErrorEmbed('An error occured while saving your data.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await i.reply({
      content: `You paid $${upgradeCost} to upgrade ${i.customId}.`,
    });
  } catch (error) {
    return console.error(
      'An error occured while collecting the response:',
      error
    );
  }
};

export { data, execute };
