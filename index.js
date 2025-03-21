const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const BotState = require('./utils/state');

require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions
    ] 
});
const state = new BotState();

// Загрузка команд
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commands = require(filePath);
    
    // Проверяем, является ли экспорт массивом команд или одной командой
    if (Array.isArray(commands)) {
        for (const command of commands) {
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
            }
        }
    } else if (commands.data && commands.execute) {
        client.commands.set(commands.data.name, commands);
    }
}

// Загрузка событий
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args, state));
    }
}

// Регистрация slash-команд
async function registerCommands() {
    const commands = [];
    for (const command of client.commands.values()) {
        commands.push(command.data.toJSON());
    }

    try {
        await client.application.commands.set(commands);
        console.log('Slash-команды успешно зарегистрированы!');
    } catch (error) {
        console.error('Ошибка при регистрации slash-команд:', error);
    }
}

client.once('ready', () => {
    console.log(`Бот запущен как ${client.user.tag}`);
    registerCommands();
});

client.login(process.env.DISCORD_TOKEN);
