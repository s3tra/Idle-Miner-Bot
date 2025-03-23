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
import config from '../../config.json' with { type: "json" };

const data = new SlashCommandBuilder()
  .setName('upgrade')
  .setDescription('Level up your company.');

const generateProgressBar = (cur, max) => {
  const emojis = {
    roundStartEmpty: '<:EmptyLXPBar:1353004698025590856>',
    straightMiddleEmpty: '<:EmptyMXPBar:1353004432320892968>',
    roundEndEmpty: '<:EmptyRXPBar:1353004697090527313>',

    roundStartFull: '<:FullLXPBar:1353013015943057520>',
    straightMiddleFull: '<:FullMXPBar:1353014241916878920>',
    roundEndFull: '<:FullRXPBar:1353013018912624700>',
  };

  let bar = '';

  if (cur === 0) {
    bar =
      emojis.roundStartEmpty +
      emojis.straightMiddleEmpty +
      emojis.straightMiddleEmpty +
      emojis.straightMiddleEmpty +
      emojis.roundEndEmpty;
  } else if (cur === max) {
    bar =
      emojis.roundStartFull +
      emojis.straightMiddleFull +
      emojis.straightMiddleFull +
      emojis.straightMiddleFull +
      emojis.roundEndFull;
  } else {
    for (let i = 0; i < cur; i++) {
      if (i === 0) {
        bar += emojis.roundStartFull;
      } else if (i === 4) {
        bar += emojis.roundEndFull;
      } else {
        bar += emojis.straightMiddleFull;
      }
    }

    for (let i = cur; i < max; i++) {
      if (i === 4) {
        bar += emojis.roundEndEmpty;
      } else {
        bar += emojis.straightMiddleEmpty;
      }
    }
  }

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

  Object.keys(config.base_upgrades).forEach((upgradeKey) => {
    const upgrade = config.base_upgrades[upgradeKey];
    const upgradeLevel = company.upgrades[upgradeKey]
      ? company.upgrades[upgradeKey]
      : 0;

    upgradeEmbed.addFields({
      name: `${upgrade.name} (${upgradeLevel}/${upgrade.maxUpgrade})`,
      value: generateProgressBar(upgradeLevel, upgrade.maxUpgrade),
    });
  });

  const row = new ActionRowBuilder();

  Object.keys(config.base_upgrades).forEach((upgradeKey) => {
    const upgrade = config.base_upgrades[upgradeKey];

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
    withResponse: true,
  });

  try {
    const i = await createMessageComponentCollector(
      interaction,
      upgradeInteraction,
      (i) => i.user.id === interaction.user.id
    );

    if (!company.upgrades[i.customId]) company.upgrades[i.customId] = 0;

    if (
      company.upgrades[i.customId] ===
      config.base_upgrades[i.customId].maxUpgrade
    )
      return i.reply({
        embeds: [
          createErrorEmbed(
            'This item is already at the maximum upgrade level.'
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });

    const upgradeCost =
      config.base_upgrades[i.customId].basePrice *
      (company.upgrades[i.customId] + 1);
    if (company.bank < upgradeCost)
      return i.reply({
        embeds: [
          createErrorEmbed(
            `You need $${upgradeCost.toLocaleString()} to purchase this.`
          ),
        ],
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
