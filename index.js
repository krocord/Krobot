const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const staffCommands = require('./staff');
const usefulCommands = require('./useful');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const prefix = '!';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Set the bot's status
  try {
    client.user.setPresence({
      activities: [{ name: 'Coded by Krocord', type: 'WATCHING' }],
      status: 'online'
    });
    console.log('Status set to "Coded by Krocord".');
  } catch (error) {
    console.error('Failed to set status:', error);
  }
});

// Function to get a user by ID, mention, or username
async function getUser(message, identifier) {
  // Check for a mention
  const userMention = message.mentions.users.first();
  if (userMention) return userMention;

  // Check if it's a user ID
  if (identifier && !isNaN(identifier)) {
    try {
      const member = await message.guild.members.fetch(identifier);
      return member; // Return the member object
    } catch {
      // Not found; continue to check username
    }
  }

  // Lastly, check by username (case-insensitive)
  if (identifier && typeof identifier === 'string') {
    const members = await message.guild.members.fetch();
    const member = members.find(member => 
      member.user.username.toLowerCase() === identifier.toLowerCase() || 
      member.displayName.toLowerCase() === identifier.toLowerCase()
    );
    if (member) return member; // Return the member found
  }

  return null; // Return null if identifier is undefined or not a valid string
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'rules') {
    const embed = new EmbedBuilder()
      .setTitle('Server Rules')
      .setDescription('Here are the server rules:')
      .addFields(
        { name: '1.', value: 'Be respectful to everyone.', inline: false },
        { name: '2.', value: 'No spamming or flooding the chat.', inline: false },
        { name: '3.', value: 'No hate speech or offensive language.', inline: false },
        { name: '4.', value: 'Keep conversations in the appropriate channels.', inline: false },
        { name: '5.', value: 'Follow Discord\'s Community Guidelines.', inline: false }
      )
      .setColor(0x3498db);
    message.channel.send({ embeds: [embed] });
  }

  if (['ban', 'kick', 'mute', 'unmute', 'unban'].includes(command)) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription('You do not have permission to use this command.');
      return message.reply({ embeds: [embed] });
    }

    if (staffCommands[command]) {
      staffCommands[command](message, args);
    }
  }

  if (command === 'userinfo') {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.author;

    if (usefulCommands.userinfo) {
      usefulCommands.userinfo(message, [user.id]); // Pass the user ID to the usefulCommands
    }
  }

  if (command === 'pfp') {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.member;

    if (usefulCommands.pfp) {
      usefulCommands.pfp(message, [user.id]);
    }
  }

  if (command === 'banner') {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.member;

    if (usefulCommands.banner) {
      usefulCommands.banner(message, [user.id]);
    }
  }

  if (message.mentions.has(client.user) && !message.author.bot) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setDescription(`${message.author}, I can read messages here.`);
    message.reply({ embeds: [embed] });
  }

  if (message.content.toLowerCase().includes('bruh') && !message.author.bot) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setImage('https://tenor.com/view/bruh-gif-22596911');
    message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
