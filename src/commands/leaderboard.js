import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getData } from 'storelite2';

const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the global leaderboards.');

const execute = async (interaction) => {
  const data = await getData(true);

  const leaderboardEmbed = new EmbedBuilder()
    .setTitle('Bank Leaderboard')
    .setDescription('Showing the company bank balance leaderboard.')
    .setColor('#e05644')
    .setTimestamp();

  if (data) {
    const sortedEntries = Object.values(data).sort((a, b) => {
      if (!a.company || !b.company) return 0;
      return (b.company.bank || 0) - (a.company.bank || 0);
    });

    sortedEntries.forEach((entry, index) => {
      if (!entry.company || !entry.company.bank) return;

      leaderboardEmbed.addFields([
        {
          name: `${index + 1}. $${entry.company.bank.toLocaleString()}`,
          value: `<@${entry._key}>`,
        },
      ]);
    });
  }

  await interaction.reply({
    embeds: [leaderboardEmbed],
  });
};

export { data, execute };
