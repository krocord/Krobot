const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { EmbedBuilder } = require('discord.js');

let connection = null;
let player = createAudioPlayer();

module.exports = {
  play: async (message, args) => {
    if (!args[0]) return message.reply('Please provide a YouTube URL.');
    const url = args[0];

    if (!ytdl.validateURL(url)) return message.reply('Invalid YouTube URL.');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('You need to be in a voice channel to play music.');

    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        message.reply('Connected to the voice channel!');
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        player.stop();
        connection.destroy();
        connection = null;
        player = createAudioPlayer();
      });

      const stream = ytdl(url, { filter: 'audioonly' });

      stream.on('error', (error) => {
        console.error('Stream error:', error);
        message.reply('Failed to retrieve the audio stream.');
        if (connection) connection.destroy();
        connection = null;
        player.stop();
        player = createAudioPlayer();
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      player.on('error', (error) => {
        console.error('Player error:', error);
        message.reply('An error occurred during playback.');
        if (connection) connection.destroy();
        connection = null;
        player.stop();
        player = createAudioPlayer();
      });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Now Playing')
        .setDescription(`🎵 Now playing: [YouTube Link](${url})`)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Play error:', error);
      message.reply('An error occurred while trying to play the music.');
      if (connection) connection.destroy();
      connection = null;
      player.stop();
      player = createAudioPlayer();
    }
  },

  pause: (message) => {
    if (!player) return message.reply('No music is playing.');
    if (player.state.status === AudioPlayerStatus.Paused) return message.reply('Music is already paused.');

    player.pause();
    message.reply('Music paused.');
  },

  stop: (message) => {
    if (!player) return message.reply('No music is playing.');

    player.stop();
    if (connection) connection.destroy();
    connection = null;
    player = createAudioPlayer();

    message.reply('Music stopped and disconnected from the voice channel.');
  },

  resume: (message) => {
    if (!player) return message.reply('No music is playing.');
    if (player.state.status !== AudioPlayerStatus.Paused) return message.reply('Music is not paused.');

    player.unpause();
    message.reply('Music resumed.');
  }
};
