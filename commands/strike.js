const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Give a strike')
    .addUserOption(opt =>
      opt.setName('member').setDescription('Member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('level').setDescription('Strike 1 or 2').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('member');
    const level = interaction.options.getString('level');
    const reason = interaction.options.getString('reason');

    await interaction.reply({
      content: `⚠️ ${member.user.tag} received **${level}**\nReason: ${reason}`
    });
  }
};
