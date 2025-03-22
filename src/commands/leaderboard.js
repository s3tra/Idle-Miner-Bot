import {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  MessageFlags,
} from 'discord.js';
import { getData } from 'storelite2';
import createErrorEmbed from '../utils/createErrorEmbed.js';
import createMessageComponentCollector from '../utils/messageComponentCollector.js';

const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the global leaderboards.');

const generateSortedEmbed = (value, data) => {
  const embed = new EmbedBuilder()
    .setTitle(`${value.charAt(0).toUpperCase() + value.slice(1)} Leaderboard`)
    .setDescription(`You are viewing the global ${value} leaderboard.`)
    .setColor('#e05644')
    .setTimestamp();

  const sortedEntries = Object.values(data).sort((a, b) => {
    if (!a.company || !b.company) return 0;
    return (b.company[value] || 0) - (a.company[value] || 0);
  });

  sortedEntries.forEach((entry, index) => {
    if (!entry.company || !entry.company[value]) return;

    embed.addFields([
      {
        name: `${index + 1}. $${entry.company[value].toLocaleString()}`,
        value: `<@${entry._key}>`,
      },
    ]);
  });

  return embed;
};

const execute = async (interaction) => {
  const data = await getData(true);
  if (!data)
    return interaction.reply({
      embeds: [createErrorEmbed('Unable to locate data.')],
      flags: MessageFlags.Ephemeral,
    });

  const select = new StringSelectMenuBuilder()
    .setCustomId('leaderboard')
    .setPlaceholder('Make a selection!')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Bank Balance')
        .setDescription('List the people with the highest bank balance.')
        .setValue('bank')
        .setDefault(true),
      new StringSelectMenuOptionBuilder()
        .setLabel('Hourly Income')
        .setDescription('List the people with the highest hourly income.')
        .setValue('income')
    );

  const row = new ActionRowBuilder().addComponents(select);

  const value = 'bank';
  const leaderboardEmbed = generateSortedEmbed(value, data);

  const leaderboardInteraction = await interaction.reply({
    embeds: [leaderboardEmbed],
    components: [row],
    withResponse: true,
  });

  try {
    const i = await createMessageComponentCollector(
      interaction,
      leaderboardInteraction,
      (i) => i.user.id === interaction.user.id
    );

    const selected = i.values[0];
    const leaderboardEmbed = generateSortedEmbed(selected, data);

    await leaderboardInteraction.resource.message.edit({
      embeds: [leaderboardEmbed],
    });

    await i.reply({
      content: `You are now viewing the ${selected} leaderboard.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    return console.error(
      'An error occured while collecting the response:',
      error
    );
  }
};

export { data, execute };
