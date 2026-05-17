const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

require("dotenv").config();
const fs = require("fs");

// ======================
// CLIENT
// ======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

// ======================
// COMMANDS (INLINE SAFE VERSION)
// ======================
const onboardCommand = {
  data: new SlashCommandBuilder()
    .setName("onboard")
    .setDescription("Assign a rank to a user")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`onboard_${user.id}`)
      .setPlaceholder("Select rank")
      .addOptions(
        { label: "Recruit", value: "Recruit" },
        { label: "Firefighter I", value: "Firefighter I" },
        { label: "Firefighter II", value: "Firefighter II" },
        { label: "Lieutenant", value: "Lieutenant" }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: `Select rank for **${user.tag}**`,
      components: [row],
      ephemeral: true
    });
  }
};

const strikeCommand = {
  data: new SlashCommandBuilder()
    .setName("strike")
    .setDescription("Give a strike to a user")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`strike_${user.id}`)
      .setPlaceholder("Select strike reason")
      .addOptions(
        { label: "Tardiness", value: "Tardiness" },
        { label: "Misconduct", value: "Misconduct" },
        { label: "Inactivity", value: "Inactivity" }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: `Select strike reason for **${user.tag}**`,
      components: [row],
      ephemeral: true
    });
  }
};

// register commands in memory
client.commands.set("onboard", onboardCommand);
client.commands.set("strike", strikeCommand);

// ======================
// AUTO DEPLOY SLASH COMMANDS
// ======================
async function deployCommands() {
  try {
    console.log("[DEPLOY] Registering commands...");

    const commands = [
      onboardCommand.data.toJSON(),
      strikeCommand.data.toJSON()
    ];

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("[SUCCESS] Commands deployed");
  } catch (err) {
    console.error("[ERROR] Deploy failed:", err);
  }
}

// ======================
// READY
// ======================
client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  await deployCommands();
});

// ======================
// INTERACTIONS
// ======================
client.on(Events.InteractionCreate, async interaction => {

  // SLASH COMMANDS
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Error running command",
          ephemeral: true
        });
      }
    }
  }

  // ONBOARD DROPDOWN
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("onboard_")) {
    const userId = interaction.customId.split("_")[1];
    const rank = interaction.values[0];

    const member = await interaction.guild.members.fetch(userId);

    const role = interaction.guild.roles.cache.find(r => r.name === rank);

    if (!role) {
      return interaction.reply({
        content: "❌ Rank role not found",
        ephemeral: true
      });
    }

    await member.roles.add(role);

    return interaction.update({
      content: `✅ Assigned rank: **${rank}**`,
      components: []
    });
  }

  // STRIKE DROPDOWN
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("strike_")) {
    const userId = interaction.customId.split("_")[1];
    const reason = interaction.values[0];

    const member = await interaction.guild.members.fetch(userId);

    const role = interaction.guild.roles.cache.find(r => r.name === "Strikes");

    if (!role) {
      return interaction.reply({
        content: "❌ Strike role not found",
        ephemeral: true
      });
    }

    await member.roles.add(role);

    return interaction.update({
      content: `⚠️ Strike issued: **${reason}**`,
      components: []
    });
  }
});

// ======================
// ERROR HANDLING
// ======================
client.on("error", console.error);
client.on("warn", console.warn);

// ======================
// LOGIN
// ======================
client.login(process.env.TOKEN);
