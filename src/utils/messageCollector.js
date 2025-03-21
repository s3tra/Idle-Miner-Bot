const createMessageCollector = (interaction) => {
  return new Promise((resolve, reject) => {
    const collector = interaction.channel.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      max: 1,
      time: 15_000,
    });

    collector.on('collect', (m) => {
      resolve(m.content);
    });

    collector.on('end', async (collection, reason) => {
      if (reason == 'time') {
        await interaction.editReply({
          content: 'This interaction has expired.',
        });
        reject('This interaction has expired.');
      }
    });
  });
};

export default createMessageCollector;
