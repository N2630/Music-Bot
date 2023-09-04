const { Events } = require("discord.js")
const { ActivityType } = require("discord.js")

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.user.setActivity('Faire des tests', { type: ActivityType.Playing})
        client.user.setStatus('online')
        console.log(`╠[${client.user.tag}]: je suis connecter`)
        client.slashs = client.commands.size
        console.log(`╠J'ai correctement charger ${client.slashs} commandes`)
    }
    
}