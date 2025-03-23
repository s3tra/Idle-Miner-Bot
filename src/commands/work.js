import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { saveData, validate } from 'storelite2';
import createErrorEmbed from '../utils/createErrorEmbed.js';

const data = new SlashCommandBuilder()
  .setName('work')
  .setDescription('Earn income by working.');

const execute = async (interaction, userData) => {
  const company = userData.company;
  const date = new Date().getTime();
  let totalTime = 5;

  if (userData.lastWork)
    totalTime = Math.floor(Math.abs(userData.lastWork - date) / 60_000);

  if (totalTime < 5)
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          `You can't work right now, try again in ${5 - totalTime}m.`
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });

  userData.lastWork = date;
  const income = Math.floor(Math.random() * 500);

  const workEmbed = new EmbedBuilder()
    .setTitle('Work')
    .setDescription(`You went to work in the mines and earned **$${income}**.`)
    .setColor('#e05644')
    .setTimestamp();

  company.bank += income;

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

  await interaction.reply({
    embeds: [workEmbed],
  });
};

export { data, execute };
