const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('вебхук')
        .setDescription('Установить вебхук для отправки сообщений о поставках')
        .addStringOption(option =>
            option.setName('урл')
                .setDescription('URL вебхука Discord')
                .setRequired(true)),

    async execute(interaction, state) {
        const webhookUrl = interaction.options.getString('урл');
        
        // Проверяем, что URL похож на вебхук Discord
        if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
            await interaction.reply({ 
                content: 'Ошибка: Указанный URL не похож на вебхук Discord. URL должен начинаться с https://discord.com/api/webhooks/',
                ephemeral: true
            });
            return;
        }

        state.setWebhookUrl(webhookUrl);
        await interaction.reply({ 
            content: 'Вебхук успешно установлен!',
            ephemeral: true
        });
    }
};
