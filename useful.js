const { EmbedBuilder } = require('discord.js');

// Function to get a user by ID, mention, or username
async function getUser(message, identifier) {
  const userMention = message.mentions.users.first();
  if (userMention) return userMention;

  if (identifier && !isNaN(identifier)) {
    try {
      return await message.guild.members.fetch(identifier);
    } catch {
      // Not found; continue to check username
    }
  }

  if (identifier && typeof identifier === 'string') {
    const members = await message.guild.members.fetch();
    const member = members.find(member => member.user.username.toLowerCase() === identifier.toLowerCase());
    return member || null; // Return the member found or null if not found
  }

  return null; // Return null if identifier is undefined or not a valid string
}

module.exports = {
  userinfo: async (message, args) => {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.author; // Default to message author if not found

    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please mention a valid user or provide a valid user ID.');
      return message.reply({ embeds: [embed] });
    }

    const userInfoEmbed = new EmbedBuilder()
      .setColor('#00aaff')
      .setTitle(`${user.user.tag}'s Information`)
      .setThumbnail(user.user.displayAvatarURL())
      .addFields(
        { name: 'Username', value: user.user.tag, inline: true },
        { name: 'User ID', value: user.user.id, inline: true },
        { name: 'Account Created', value: user.user.createdAt.toDateString(), inline: true },
        { name: 'Joined Server', value: user.joinedAt ? user.joinedAt.toDateString() : 'N/A', inline: true },
        { name: 'Roles', value: user.roles.cache.map(role => role.name).join(', ') || 'None', inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [userInfoEmbed] });
  },

  pfp: async (message, args) => {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.member; // Default to message member if not found

    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please mention a valid user or provide a valid user ID.');
      return message.reply({ embeds: [embed] });
    }

    const pfpEmbed = new EmbedBuilder()
      .setColor('#00aaff')
      .setTitle(`${user.user.tag}'s Profile Picture`)
      .setImage(user.user.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [pfpEmbed] });
  },

  banner: async (message, args) => {
    const userIdentifier = args[0];
    const user = await getUser(message, userIdentifier) || message.member; // Default to message member if not found

    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('User not found. Please mention a valid user or provide a valid user ID.');
      return message.reply({ embeds: [embed] });
    }

    try {
      const fetchedUser = await user.user.fetch();
      const bannerURL = fetchedUser.bannerURL({ size: 2048, dynamic: true });

      if (bannerURL) {
        const bannerEmbed = new EmbedBuilder()
          .setColor('#00aaff')
          .setTitle(`${user.user.tag}'s Banner`)
          .setImage(bannerURL)
          .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
          .setTimestamp();

        message.channel.send({ embeds: [bannerEmbed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setDescription('This user does not have a banner or the bot cannot access it.');
        message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('There was an error fetching the banner.');
      message.reply({ embeds: [embed] });
    }
  }
};
