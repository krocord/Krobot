const { EmbedBuilder } = require('discord.js');

module.exports = {
  userinfo: async (message, args) => {
    let user;
    if (args[0]) {
      const userID = args[0].replace(/\D/g, ''); // Remove non-digit characters
      try {
        user = await message.guild.members.fetch(userID);
      } catch (error) {
        return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
      }
    } else if (message.mentions.members.size) {
      user = message.mentions.members.first();
    } else {
      return message.reply('Please mention a user or provide their ID.');
    }

    if (!user) {
      return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
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
        { name: 'Roles', value: user.roles.cache.map(role => role.name).join(', '), inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [userInfoEmbed] });
  },

  pfp: async (message, args) => {
    let user;
    if (args[0]) {
      const userID = args[0].replace(/\D/g, ''); // Remove non-digit characters
      try {
        user = await message.guild.members.fetch(userID);
      } catch (error) {
        return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
      }
    } else if (message.mentions.members.size) {
      user = message.mentions.members.first();
    } else {
      user = message.member;
    }

    if (!user) {
      return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
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
    let user;
    if (args[0]) {
      const userID = args[0].replace(/\D/g, ''); // Remove non-digit characters
      try {
        user = await message.guild.members.fetch(userID);
      } catch (error) {
        return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
      }
    } else if (message.mentions.members.size) {
      user = message.mentions.members.first();
    } else {
      user = message.member;
    }

    if (!user) {
      return message.reply('User not found. Please mention a valid user or provide a valid user ID.');
    }

    try {
      // Fetch the user object to ensure we have the latest data
      const fetchedUser = await user.user.fetch();

      // Get the banner URL
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
        message.reply('This user does not have a banner or the bot cannot access it.');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      message.reply('There was an error fetching the banner.');
    }
  }
};
