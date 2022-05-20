import DiscordJS from 'discord.js';
import * as server from './server';
import dotenv from 'dotenv';
import * as commands from './commands';

export const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });

dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
export const apiKey = process.env.API;

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user?.tag}. Prefix: ${prefix}`);
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${prefix}`)) return;

    const content = String(message);
    const args = content.substring(content.indexOf(' ') + 1);

    if (content.startsWith(`${prefix}temp`)) {
        await commands.now(message, args);
    }
    if (content.startsWith(`${prefix}hourly`)) {
        await commands.hourly(message, args);
    }
    if (content.startsWith(`${prefix}today`)) {
        await commands.today(message, args);
    }
    if (content.startsWith(`${prefix}tomorrow`)) {
        await commands.tomorrow(message, args);
    }
    if (content.startsWith(`${prefix}dailyReminder`)) {
        await commands.dailyReminder(message, args);
    }
});

// server.keepAlive();
client.login(String(token));