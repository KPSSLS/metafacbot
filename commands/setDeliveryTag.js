const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('утэгпоставок')
        .setDescription('Указать тег для упоминания в поставках')
        .addRoleOption(option =>
            option.setName('тег')
                .setDescription('Выберите роль для упоминания')
                .setRequired(true)),

    async execute(interaction, state) {
        const tag = interaction.options.getRole('тег');
        state.setDeliveryTag(tag);
        await interaction.reply({ 
            content: `Тег для поставок установлен: ${tag}`,
            ephemeral: true
        });
    }
};
