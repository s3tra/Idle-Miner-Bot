import {
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  StringSelectMenuBuilder,
} from 'discord.js';

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
        ...reply.resource.message.components[0].components.map((component) => {
          if (component.type === ComponentType.Button) {
            const button = new ButtonBuilder(component.data);
            button.setDisabled(true);

            return button;
          } else if (component.type === ComponentType.StringSelect) {
            const select = new StringSelectMenuBuilder(component.data);
            select.setDisabled(true);

            return select;
          }
        })
      );

      if (disabledRow.components.length > 0)
        await reply.resource.message.edit({ components: [disabledRow] });

      if (reason == 'time') {
        reject('This interaction has expired.');
      }
    });
  });
};

export default createMessageComponentCollector;
