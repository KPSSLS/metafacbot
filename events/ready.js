module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Бот готов к работе! Авторизован как ${client.user.tag}`);
    }
};
