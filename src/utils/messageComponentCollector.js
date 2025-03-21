import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

const createMessageComponentCollector = (interaction, reply, filter) => {
  return new Promise((resolve, reject) => {
    const collector = interaction.channel.createMessageComponentCollector({
      filter: filter,
      max: 1,
      time: 15_000,
    });

    collector.on('collect', (i) => {
      resolve(i);
    });

    collector.on('end', async (collection, reason) => {
      const disabledRow = new ActionRowBuilder().addComponents(
        ...reply.components[0].components.map((buttonComponent) => {
          const button = new ButtonBuilder(buttonComponent.data);
          button.setDisabled(true);

          return button;
        })
      );

      await reply.edit({ components: [disabledRow] });

      if (reason == 'time') {
        reject('This interaction has expired.');
      }
    });
  });
};

export default createMessageComponentCollector;
