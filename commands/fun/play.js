const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { playMusic, queue } = require('../../utils/musicPlayer');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music in a voice channel')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL of the music to play')
                .setRequired(true)),
    category: "fun",
    async execute(interaction) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            interaction.editReply({ content: 'You need to be in a voice channel to use this command.', ephemeral: true });
            return;
        }

        const url = interaction.options.getString('url');
        const verifyUrl = url.trim().toLowerCase();

        if (!verifyUrl.includes("https://www.youtube.com")) {
            interaction.editReply({ content: "The link is incorrect or unsupported.", ephemeral: true });
            return;
        }

        if (!queue.has(interaction.guild.id)) {
            queue.set(interaction.guild.id, []);
        }

        const guildQueue = queue.get(interaction.guild.id);

        guildQueue.push(url);

        const videoInfo = await ytdl.getInfo(url);
        const videoTitle = videoInfo.videoDetails.title;
        const videoThumbnail = videoInfo.videoDetails.thumbnails[0].url;
        const videoDuration = videoInfo.videoDetails.lengthSeconds;

        const minutes = Math.floor(videoDuration / 60);
        const seconds = videoDuration % 60;

        const queueEmbed = new EmbedBuilder()
            .setColor("DarkVividPink")
            .setTitle(videoTitle)
            .setURL(url)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(videoThumbnail)
            .addFields({ name: "Durée:", value: `${minutes}:${seconds} ` });

        await interaction.editReply({ content: "Music add to the queue:", embeds: [queueEmbed] });

        if (guildQueue.length === 1) {
            playMusic(guildQueue[0], interaction, voiceChannel);
        }
    },
};
