const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('уканалоткатов')
        .setDescription('Установить канал для запросов отката')
        .addChannelOption(option =>
            option.setName('канал')
                .setDescription('Канал для запросов отката')
                .setRequired(true)),

    async execute(interaction, state) {
        try {
            const channel = interaction.options.getChannel('канал');
            state.setRollbackChannel(channel);

            await interaction.reply({
                content: `Канал для запросов отката успешно установлен: ${channel}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Ошибка установки канала отката:', error);
            await interaction.reply({
                content: 'Произошла ошибка при установке канала отката',
                ephemeral: true
            });
        }
    }
};
