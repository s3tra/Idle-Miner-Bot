import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { saveData, validate } from 'storelite2';
import createErrorEmbed from '../utils/createErrorEmbed.js';
import createMessageComponentCollector from '../utils/messageComponentCollector.js';
import config from '../../config.json' with { type: "json" };

const data = new SlashCommandBuilder()
  .setName('hire')
  .setDescription('Hire staff members.');

const execute = async (interaction, userData) => {
  const company = userData.company;
  if (!company.staff) company.staff = 0;
  if (!company.bank) company.bank = 0;
  
  const hireEmbed = new EmbedBuilder()
    .setTitle('Hire')
    .setDescription(
      'Hire staff to boost your income - earn $50 per hour for each team member you bring on board!'
    )
    .setFields([{ name: 'Staff', value: company.staff.toLocaleString() }])
    .setThumbnail(interaction.client.user.avatarURL())
    .setColor('#e05644')
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Hire')
      .setCustomId('hire_staff')
      .setStyle(ButtonStyle.Primary)
  );

  const hireInteraction = await interaction.reply({
    embeds: [hireEmbed],
    components: [row],
    withResponse: true,
  });

  try {
    const i = await createMessageComponentCollector(
      interaction,
      hireInteraction,
      (i) => i.user.id === interaction.user.id
    );

    if (company.staff === config.staff_upgrades.maxUpgrade)
      return i.reply({
        embeds: [createErrorEmbed('You have the maximum amount of staff.')],
        flags: MessageFlags.Ephemeral,
      });

    const upgradeCost = config.staff_upgrades.basePrice * (company.staff + 1);
    if (company.bank < upgradeCost)
      return i.reply({
        embeds: [
          createErrorEmbed(`You need $${upgradeCost.toLocaleString()} to purchase this.`),
        ],
        flags: MessageFlags.Ephemeral,
      });

    company.bank -= upgradeCost;
    company.staff += 1;

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
      content: `You paid $${upgradeCost}, and have gained one staff member.`,
    });
  } catch (error) {
    return console.error(
      'An error occured while collecting the response:',
      error
    );
  }
};

export { data, execute };
