const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onboard')
    .setDescription('Onboard a member')
    .addUserOption(opt =>
      opt.setName('member').setDescription('Member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('name').setDescription('RP Name').setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('member');
    const name = interaction.options.getString('name');

    if (!member) {
      return interaction.reply({ content: "Member not found", ephemeral: true });
    }

    await member.setNickname(`ONBOARD | ${name}`);

    await interaction.reply({
      content: `✅ ${member.user.tag} has been onboarded as **${name}**`
    });
  }
};
