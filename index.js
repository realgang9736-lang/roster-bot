const {
  Client,
  GatewayIntentBits,
  REST,
  Routes
} = require("discord.js");

require("dotenv").config();
const fs = require("fs");

// ======================
// CLIENT SETUP (FIX FIX FIX)
// ======================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ======================
// LOAD COMMANDS
// ======================
const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  console.log(`[LOAD] ${file}`);
}

// ======================
// AUTO DEPLOY SLASH COMMANDS
// ======================
async function deployCommands() {
  try {
    console.log("[DEPLOY] Registering slash commands...");

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("[SUCCESS] Slash commands deployed");
  } catch (err) {
    console.error("[ERROR] Failed to deploy commands:", err);
  }
}

// ======================
// READY EVENT
// ======================
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`Guild: ${process.env.GUILD_ID}`);

  await deployCommands();
});

// ======================
// INTERACTIONS HANDLER
// ======================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = require(`./commands/${interaction.commandName}`);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Error executing command",
      ephemeral: true
    });
  }
});

// ======================
// ERROR LOGGING
// ======================
client.on("error", console.error);
client.on("warn", console.warn);

// ======================
// LOGIN
// ======================
client.login(process.env.TOKEN);
