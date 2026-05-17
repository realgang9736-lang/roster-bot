const { Client, GatewayIntentBits, Partials } = require("discord.js");
require("dotenv").config();

// ✅ CREATE CLIENT FIRST (this fixes your crash)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

// READY EVENT
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`Guilds: ${client.guilds.cache.size}`);
});

// ERROR LOGGING (important for debugging)
client.on("error", console.error);
client.on("warn", console.warn);

// LOGIN (VERY IMPORTANT)
client.login(process.env.TOKEN);
