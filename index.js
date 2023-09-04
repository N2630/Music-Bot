//----------------------------------Relatif à Index.js------------------------------------------------
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: 3276799 });
const { token, guild_Id, GPT_Api_Key } = require("./config.json");


module.exports = { client}


//----------------------------------Relatif à la DB---------------------------------------------------

const { error } = require("node:console");


//----------------------------------Relatif aux commandes---------------------------------------------
//const giveUserXp = require("./events/messageCreate/giveUserXp");


//--------------------------------Connection à la DB----------------------------------------------------
(async () => {
  try {
    await connectToDB(); 
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

//-------------------------------------Collections--------------------------------------------------------
client.cooldowns = new Collection();
client.commands = new Collection();
client.folder = new Collection();
client.slashs = [];


//--------------------------------------------Gestion commandes--------------------------------------------
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

client.commands.clear();

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(foldersPath, folder))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, folder, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      const commandName = command.data.name;
      if (!client.commands.has(commandName)) {
        client.commands.set(commandName, command);
      }
    } else {
      console.log(
        `[ATTENTION] La commande dans le fichier ${filePath} est manquante, une propriété "data" ou "execute" est requise.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}



//---------------------------------------------------Event et autres-----------------------------------------
client.on("error", (error) => {
  console.error('Une erreur non gérée est survenue :', error)
})








//----------------------------------------------------------------------------------------------------------------


client.login(token);
