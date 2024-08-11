const { Client, GatewayIntentBits } = require('discord.js');
const staffCommands = require('./staff');
const usefulCommands = require('./useful');
const musicCommands = require('./music');

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

client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'rules') {
    message.channel.send(`Here are the server rules:
1. Be respectful to everyone.
2. No spamming or flooding the chat.
3. No hate speech or offensive language.
4. Keep conversations in the appropriate channels.
5. Follow Discord's Community Guidelines.`);
  }

  if (['ban', 'kick', 'mute', 'unmute', 'unban'].includes(command)) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    if (staffCommands[command]) {
      staffCommands[command](message, args);
    }
  }

  if (command === 'userinfo') {
    if (usefulCommands.userinfo) {
      usefulCommands.userinfo(message, args);
    }
  }

  if (command === 'pfp') {
    if (usefulCommands.pfp) {
      usefulCommands.pfp(message, args);
    }
  }

  if (command === 'banner') {
    if (usefulCommands.banner) {
      usefulCommands.banner(message, args);
    }
  }

  if (command === 'play') {
    if (musicCommands.play) {
      musicCommands.play(message, args);
    }
  }

  if (command === 'pause') {
    if (musicCommands.pause) {
      musicCommands.pause(message);
    }
  }

  if (command === 'stop') {
    if (musicCommands.stop) {
      musicCommands.stop(message);
    }
  }

  if (message.mentions.has(client.user) && !message.author.bot) {
    message.reply(`${message.author}, I can read messages here.`);
  }

  if (message.content.toLowerCase().includes('bruh') && !message.author.bot) {
    message.reply('https://tenor.com/view/bruh-gif-22596911');
  }
});

client.login(process.env.TOKEN);
