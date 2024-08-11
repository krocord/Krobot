const { PermissionsBitField } = require('discord.js');

module.exports = {
  ban: async (message, args) => {
    const userID = args[0];
    if (!userID) {
      return message.reply('Please provide the ID of the user to ban.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const user = await message.guild.members.fetch(userID);
      if (!user.bannable) {
        return message.reply('I cannot ban this user.');
      }

      await user.ban({ reason });
      message.reply(`${user.user.tag} has been banned for: ${reason}`);
    } catch (error) {
      message.reply(`Sorry, I couldn't ban the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
    }
  },

  kick: async (message, args) => {
    const userID = args[0];
    if (!userID) {
      return message.reply('Please provide the ID of the user to kick.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const user = await message.guild.members.fetch(userID);
      if (!user.kickable) {
        return message.reply('I cannot kick this user.');
      }

      await user.kick(reason);
      message.reply(`${user.user.tag} has been kicked for: ${reason}`);
    } catch (error) {
      message.reply(`Sorry, I couldn't kick the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
    }
  },

  mute: async (message, args) => {
    const userID = args[0];
    if (!userID) {
      return message.reply('Please provide the ID of the user to mute.');
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

        message.channel.send('Mute role was not found, so I created one.');
      } catch (error) {
        return message.reply('I do not have sufficient permissions to create the "Muted" role.');
      }
    }

    try {
      const member = await message.guild.members.fetch(userID);
      await member.roles.add(muteRole);
      message.reply(`${member.user.tag} has been muted.`);
    } catch (error) {
      message.reply(`Sorry, I couldn't mute the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
    }
  },

  unmute: async (message, args) => {
    const userID = args[0];
    if (!userID) {
      return message.reply('Please provide the ID of the user to unmute.');
    }

    const muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
    if (!muteRole) {
      return message.reply('Mute role does not exist.');
    }

    try {
      const member = await message.guild.members.fetch(userID);
      await member.roles.remove(muteRole);
      message.reply(`${member.user.tag} has been unmuted.`);
    } catch (error) {
      message.reply(`Sorry, I couldn't unmute the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
    }
  },

  unban: async (message, args) => {
    const userID = args[0];
    if (!userID) {
      return message.reply('Please provide the ID of the user to unban.');
    }

    try {
      await message.guild.bans.remove(userID);
      message.reply(`User with ID ${userID} has been unbanned.`);
    } catch (error) {
      message.reply(`Sorry, I couldn't unban the user. Make sure the ID is correct and I have sufficient permissions. Error: ${error}`);
    }
  }
};
