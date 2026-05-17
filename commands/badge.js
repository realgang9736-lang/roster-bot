const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Get your department badge'),

  async execute(interaction) {
    const file = path.join(__dirname, '..', 'assets', 'badge.png');

    const attachment = new AttachmentBuilder(file);

    await interaction.reply({
      content: "🚔 Patrol Badge Issued",
      files: [attachment]
    });
  }
};
