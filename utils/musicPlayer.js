const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const ytdl = require('ytdl-core-discord');

const queue = new Map();

module.exports = {
    playMusic,
    queue,
};

async function playMusic(url, interaction, voiceChannel) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const videoThumbnail = videoInfo.videoDetails.thumbnails[0].url;
    const videoDuration = videoInfo.videoDetails.lengthSeconds;

    const minutes = Math.floor(videoDuration / 60);
    const seconds = videoDuration % 60;

    const playEmbed = new EmbedBuilder()
        .setColor("Fuchsia")
        .setTitle(videoTitle)
        .setURL(url)
        .setThumbnail(videoThumbnail)
        .addFields({ name: "Durée:", value: `${minutes}:${seconds} ` });

    const resource = createAudioResource(await ytdl(url), { inlineVolume: true });
    const player = createAudioPlayer();
    resource.volume.setVolume(0.25);

    connection.subscribe(player);

    player.play(resource);

    player.on(AudioPlayerStatus.Idle, async () => {
        const guildQueue = queue.get(interaction.guild.id);
        guildQueue.shift();
        if (guildQueue.length > 0) {
            const nextUrl = guildQueue[0];
            playMusic(nextUrl, interaction, voiceChannel);
        } else {
            connection.destroy();
            queue.delete(interaction.guild.id);
        }
    });

    await interaction.followUp({ content: "Playing:", embeds: [playEmbed] });
}
