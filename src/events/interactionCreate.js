import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getData, saveData } from 'storelite2';
import createErrorEmbed from '../utils/createErrorEmbed.js';

const execute = async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      return console.error(
        `No command matching ${interaction.commandName} was found.`
      );
    }

    let userData = await getData(interaction.user.id);
    if (!userData) {
      userData = { _key: interaction.user.id };
      await saveData(userData);
    }

    if (!userData.company && interaction.commandName !== 'start') {
      const welcomeEmbed = new EmbedBuilder()
        .setTitle('Before you can run commands:')
        .setDescription(
          'Thanks for using Idle Miner!\nBefore you can run any commands, you must create your mining company. Try running `/start`.'
        )
        .setThumbnail(interaction.client.user.avatarURL())
        .setColor('#e05644')
        .setTimestamp();

      return interaction.reply({
        embeds: [welcomeEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await command.execute(interaction, userData);
    } catch (error) {
      await interaction.reply({
        embeds: [
          createErrorEmbed('An error occured while executing the command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });

      return console.error(
        `An error occured while executing ${interaction.commandName}: `,
        error
      );
    }
  }
};

export { execute };
