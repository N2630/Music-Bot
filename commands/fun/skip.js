const { SlashCommandBuilder } = require('discord.js');
const { queue, playMusic } = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip to the next music in the queue.'),
    category: 'fun',
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel to use this command.');
        }

        const guildQueue = queue.get(interaction.guild.id);

        if (!guildQueue || guildQueue.length === 0) {
            return interaction.reply('There is no music in the queue.');
        }

        // Supprime la première chanson de la file d'attente
        guildQueue.shift();

        if (guildQueue.length > 0) {
            const nextUrl = guildQueue[0];
            playMusic(nextUrl, interaction, voiceChannel); // Jouer la prochaine musique dans la file d'attente
            await interaction.reply('I move on to the next music in the queue');
        } else {
            await interaction.reply('There is no music in the queue.');
        }
    },
};