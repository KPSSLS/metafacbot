const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('уканалотчетапоставок')
        .setDescription('Указать канал для отчетов поставок')
        .addChannelOption(option =>
            option.setName('канал')
                .setDescription('Выберите канал')
                .setRequired(true)),

    async execute(interaction, state) {
        const channel = interaction.options.getChannel('канал');
        state.setReportChannel(channel);
        await interaction.reply({ 
            content: `Канал для отчетов установлен: ${channel}`,
            ephemeral: true
        });
    }
};
