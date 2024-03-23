const { Events } = require("discord.js")
const { ActivityType } = require("discord.js")

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.user.setActivity('Making tests', { type: ActivityType.Playing})
        client.user.setStatus('online')
        console.log(`╠[${client.user.tag}]: I'm connected`)
        client.slashs = client.commands.size
        console.log(`╠I have loaded ${client.slashs} commands`)
    }
    
}