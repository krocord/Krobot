const { EmbedBuilder } = require('discord.js');

// Function to get a user by ID, mention, or username
async function getUser(message, identifier) {
  // Check for a mention
  const userMention = message.mentions.users.first();
  if (userMention) return userMention;

  // Check if it's a user ID
  if (!isNaN(identifier)) {
    try {
      return await message.guild.members.fetch(identifier);
    } catch {
      // Not found; continue to check username
    }
  }

  // Lastly, check by username
  const members = await message.guild.members.fetch();
  const member = members.find(member => member.user.username.toLowerCase() === identifier.toLowerCase());
  return member || null; // Return the member found or null if not found
}

module.exports = {
  ban: async (message, args) => {
    const userIdentifier = args[0];
    if (!userIdentifier) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Please provide the ID, mention, or username of the user to ban.');
      return message.reply({ embeds: [embed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const user = await getUser(message, userIdentifier);
    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please provide a valid user ID, mention, or username.');
      return message.reply({ embeds: [embed] });
    }

    if (!user.bannable) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('I cannot ban this user.');
      return message.reply({ embeds: [embed] });
    }

    await user.ban({ reason });
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setDescription(`${user.user.tag} has been banned for: ${reason}`);
    message.reply({ embeds: [embed] });
  },

  kick: async (message, args) => {
    const userIdentifier = args[0];
    if (!userIdentifier) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Please provide the ID, mention, or username of the user to kick.');
      return message.reply({ embeds: [embed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const user = await getUser(message, userIdentifier);
    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please provide a valid user ID, mention, or username.');
      return message.reply({ embeds: [embed] });
    }

    if (!user.kickable) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('I cannot kick this user.');
      return message.reply({ embeds: [embed] });
    }

    await user.kick(reason);
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setDescription(`${user.user.tag} has been kicked for: ${reason}`);
    message.reply({ embeds: [embed] });
  },

  mute: async (message, args) => {
    const userIdentifier = args[0];
    if (!userIdentifier) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Please provide the ID, mention, or username of the user to mute.');
      return message.reply({ embeds: [embed] });
    }

    let muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

    if (!muteRole) {
      try {
        muteRole = await message.guild.roles.create({
          name: 'Muted',
          color: '#514f48',
          permissions: []
        });

        message.guild.channels.cache.forEach(async (channel) => {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            AddReactions: false,
            Speak: false
          });
        });

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setDescription('Mute role was not found, so I created one.');
        message.channel.send({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setDescription('I do not have sufficient permissions to create the "Muted" role.');
        return message.reply({ embeds: [embed] });
      }
    }

    const member = await getUser(message, userIdentifier);
    if (!member) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please provide a valid user ID, mention, or username.');
      return message.reply({ embeds: [embed] });
    }

    await member.roles.add(muteRole);
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setDescription(`${member.user.tag} has been muted.`);
    message.reply({ embeds: [embed] });
  },

  unmute: async (message, args) => {
    const userIdentifier = args[0];
    if (!userIdentifier) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Please provide the ID, mention, or username of the user to unmute.');
      return message.reply({ embeds: [embed] });
    }

    const muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
    if (!muteRole) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Mute role does not exist.');
      return message.reply({ embeds: [embed] });
    }

    const member = await getUser(message, userIdentifier);
    if (!member) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please provide a valid user ID, mention, or username.');
      return message.reply({ embeds: [embed] });
    }

    await member.roles.remove(muteRole);
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setDescription(`${member.user.tag} has been unmuted.`);
    message.reply({ embeds: [embed] });
  },

  unban: async (message, args) => {
    const userIdentifier = args[0];
    if (!userIdentifier) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('Please provide the ID, mention, or username of the user to unban.');
      return message.reply({ embeds: [embed] });
    }

    const userID = userIdentifier.replace(/\D/g, ''); // Get just the digits

    try {
      await message.guild.bans.remove(userID);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setDescription(`User with ID ${userID} has been unbanned.`);
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(`Sorry, I couldn't unban the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
      message.reply({ embeds: [embed] });
    }
  }
};
