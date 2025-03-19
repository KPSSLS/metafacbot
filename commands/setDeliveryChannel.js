const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('уканалпоставок')
        .setDescription('Указать канал для поставок')
        .addChannelOption(option =>
            option.setName('канал')
                .setDescription('Выберите канал')
                .setRequired(true)),

    async execute(interaction, state) {
        const channel = interaction.options.getChannel('канал');
        state.setDeliveryChannel(channel);
        await interaction.reply({ 
            content: `Канал для поставок установлен: ${channel}`,
            ephemeral: true
        });
    }
};
