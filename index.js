const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  Events,
  InteractionResponseFlags
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

// ======================
// CLIENT SETUP
// ======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// ======================
// LOAD COMMANDS
// ======================
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (!command.data || !command.execute) {
    console.log(`[SKIP] ${file} missing data or execute`);
    continue;
  }

  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());

  console.log(`[LOAD] ${file}`);
}

// ======================
// DEPLOY SLASH COMMANDS
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
    console.error("[ERROR] Command deploy failed:", err);
  }
}

// ======================
// READY EVENT
// ======================
client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`Guild: ${process.env.GUILD_ID}`);

  await deployCommands();
});

// ======================
// INTERACTION HANDLER
// ======================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.log(`[WARN] Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[ERROR] Command failed:`, err);

    if (interaction.replied || interaction.deferred) return;

    await interaction.reply({
      content: "❌ Something went wrong while running this command.",
      flags: InteractionResponseFlags.Ephemeral
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
