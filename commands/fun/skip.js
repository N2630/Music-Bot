const { SlashCommandBuilder } = require('discord.js');
const { getConnection, queue, playMusic } = require("./play");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Passe à la musique suivante dans la file d\'attente'),
    category: 'fun',
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('Vous devez être dans un canal vocal pour utiliser cette commande.');
        }

        const guildQueue = queue.get(interaction.guild.id);

        if (!guildQueue || guildQueue.length === 0) {
            return interaction.reply('Il n\'y a aucune musique dans la file d\'attente.');
        }

        // Passer à la musique suivante en retirant la première de la file d'attente
        guildQueue.shift();

        if (guildQueue.length > 0) {
            const nextUrl = guildQueue[0];
            playMusic(nextUrl, interaction, voiceChannel); // Jouer la prochaine musique dans la file d'attente
            interaction.reply('Musique suivante.');
        } else {
            // S'il n'y a plus de musique dans la file d'attente, détruire la connexion
            const connection = getConnection(interaction.guild.id);
            if (connection) {
                connection.destroy();
            }
            queue.delete(interaction.guild.id);
            interaction.reply('File d\'attente vide. Connexion détruite.');
        }
    },
};
