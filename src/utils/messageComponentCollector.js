const createMessageComponentCollector = (interaction) => {
  return new Promise((resolve, reject) => {
    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      max: 1,
      time: 15_000,
    });

    collector.on('collect', (i) => {
      resolve(i);
    });

    collector.on('end', async (collection, reason) => {
      if (reason == 'time') {
        await interaction.editReply({
          content: 'This interaction has expired.',
          components: [],
        });
        reject('This interaction has expired.');
      }
    });
  });
};

export default createMessageComponentCollector;
