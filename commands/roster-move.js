const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roster-move')
    .setDescription('Move a member to a new rank')
    .addUserOption(opt =>
      opt.setName('member').setDescription('Member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('rank').setDescription('New Rank').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('member');
    const rank = interaction.options.getString('rank');
    const reason = interaction.options.getString('reason');

    await member.setNickname(`${rank} | ${member.user.username}`);

    await interaction.reply({
      content: `📊 ${member.user.tag} moved to **${rank}**\nReason: ${reason}`
    });
  }
};
