const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const factions = [
    { name: 'Vagos', id: 'vagos', emoji: '🟨' },
    { name: 'Ballas', id: 'ballas', emoji: '🟪' },
    { name: 'Marabunta', id: 'marabunta', emoji: '🟦' },
    { name: 'Famillies', id: 'famillies', emoji: '🟩' },
    { name: 'Bloods', id: 'bloods', emoji: '🟥' },
    { name: 'Moders', id: 'moders', emoji: '👮' },
    { name: 'Revive', id: 'revive', emoji: '🏥' },
    { name: 'Managment', id: 'managment', emoji: '👑' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('роли')
        .setDescription('Отправить сообщение для выбора ролей'),

    async execute(interaction, state) {
        // Создаем ряды кнопок (по 4 кнопки в ряду)
        const rows = [];
        for (let i = 0; i < factions.length; i += 4) {
            const row = new ActionRowBuilder()
                .addComponents(
                    factions.slice(i, i + 4).map(faction => 
                        new ButtonBuilder()
                            .setCustomId(`role-${faction.id}`)
                            .setLabel(faction.name)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(faction.emoji)
                    )
                );
            rows.push(row);
        }

        await interaction.channel.send({
            content: 'Уважаемые игроки, приветствуем вас на сервере Meta Factions! Выберите роль своей фракции:',
            components: rows
        });

        await interaction.reply({
            content: 'Сообщение с ролями отправлено!',
            ephemeral: true
        });
    }
};
