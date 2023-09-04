const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

// Importez AudioPlayerStatus depuis @discordjs/voice
const { AudioPlayerStatus } = require('@discordjs/voice');

const queue = new Map();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Joue de la musique dans un canal vocal')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('URL de la musique à jouer')
                .setRequired(true)),
    category: "fun",
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({content: 'Vous devez être dans un canal vocal pour utiliser cette commande.', ephemeral: true});
        }

        const url = interaction.options.getString('url');
        const verifyUrl = url.trim().toLowerCase()

        if ( !verifyUrl.includes("https://www.youtube.com")) {
            interaction.reply({content: "Ceci n'est pas un lien commençant par 'https'.", ephemeral: true});
            return;
        }
        await interaction.deferReply()

        if (!queue.has(interaction.guild.id)) {
            queue.set(interaction.guild.id, []);
        }

        const guildQueue = queue.get(interaction.guild.id);

        // Ajouter la musique à la file d'attente
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

        ;
        await interaction.editReply({ content: "Musique ajoutée à la file d'attente:", embeds: [queueEmbed] });

        if (guildQueue.length === 1) {
            // Si la file d'attente est vide, commencer à jouer la première musique
            playMusic(guildQueue[0], interaction, voiceChannel);
        }
    },
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

    const resource = createAudioResource(await ytdl(url), {inlineVolume: true})
    const player = createAudioPlayer();
    resource.volume.setVolume(0.25)

    connection.subscribe(player);
    
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, async () => {
        const guildQueue = queue.get(interaction.guild.id);
        guildQueue.shift(); // Retirer la première chanson de la file d'attente

        if (guildQueue.length > 0) {
            const nextUrl = guildQueue[0];
            playMusic(nextUrl, interaction, voiceChannel); // Jouer la prochaine musique dans la file d'attente
        } else {
            connection.destroy();
            queue.delete(interaction.guild.id);
        }
    });

    await interaction.followUp({ content: "En train de jouer:", embeds: [playEmbed] });
}
