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
import createMessageCollector from '../utils/messageCollector.js';

const data = new SlashCommandBuilder()
  .setName('start')
  .setDescription('Start your idle adventure - build your first company!');

const execute = async (interaction, userData) => {
  let company = userData.company;
  if (company)
    return interaction.reply({
      content: 'You already have a company.',
      flags: MessageFlags.Ephemeral,
    });

  company = { income: 100, lastCollection: new Date().getTime() };

  const nameEmbed = new EmbedBuilder()
    .setTitle('Company Setup')
    .setDescription('What would you like to call your company?')
    .setColor('#e05644')
    .setTimestamp();

  await interaction.reply({
    embeds: [nameEmbed],
  });

  try {
    company.name = await createMessageCollector(interaction);
  } catch (error) {
    return console.error(
      'An error occured while collecting the response:',
      error
    );
  }

  const locationEmbed = new EmbedBuilder()
    .setTitle('Company Setup')
    .setDescription('Where would you like to start your company?')
    .setFields([
      { name: 'The Wastelands', value: '- 5% Income Boost' },
      { name: 'Crystal Caverns', value: '- 5% Staff Efficiency' },
      { name: 'Ironclad Depths', value: '- 5% Mining Boost' },
    ])
    .setColor('#e05644')
    .setTimestamp();

  const row = new ActionRowBuilder().setComponents(
    new ButtonBuilder()
      .setLabel('The Wastelands')
      .setCustomId('the_wastelands')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setLabel('Crystal Caverns')
      .setCustomId('crystal_caverns')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setLabel('Ironclad Depths')
      .setCustomId('ironclad_depths')
      .setStyle(ButtonStyle.Danger)
  );

  const locationInteraction = await interaction.channel.send({
    embeds: [locationEmbed],
    components: [row],
    withResponse: true,
  });

  try {
    const i = await createMessageComponentCollector(
      locationInteraction,
      locationInteraction,
      (i) => i.user.id === interaction.user.id
    );
    company.location = i.customId;

    await i.reply({
      content: `You selected **${i.customId}**.`,
    });
  } catch (error) {
    return console.error(
      'An error occured while collecting the response:',
      error
    );
  }

  const successEmbed = new EmbedBuilder()
    .setTitle('Company Setup')
    .setDescription('Congratulations! You started your first company.')
    .setFields([
      {
        name: 'Company Name',
        value: company.name ? company.name : 'Unknown',
        inline: true,
      },
      {
        name: 'Company Location',
        value: company.location ? company.location : 'Unknown',
        inline: true,
      },
    ])
    .setThumbnail(interaction.client.user.avatarURL())
    .setColor('#e05644')
    .setTimestamp();

  userData.company = company;

  try {
    validate(userData);
    await saveData(userData);
  } catch (error) {
    console.error('Error saving data:', error);

    return locationInteraction.reply({
      embeds: [createErrorEmbed('An error occured while saving your data.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  await locationInteraction.reply({
    embeds: [successEmbed],
  });
};

export { data, execute };
