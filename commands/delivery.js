const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('поставка')
        .setDescription('Создать новую поставку'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('delivery-modal')
            .setTitle('Новая поставка');

        const dateInput = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Дата')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const timeInput = new TextInputBuilder()
            .setCustomId('time')
            .setLabel('Время')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const driverInput = new TextInputBuilder()
            .setCustomId('driver')
            .setLabel('Кто везет')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(timeInput),
            new ActionRowBuilder().addComponents(driverInput)
        );

        await interaction.showModal(modal);
    }
};
