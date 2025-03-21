const { SlashCommandBuilder } = require('discord.js');

const factions = [
    { name: 'vagos', description: 'Установить роль для Vagos' },
    { name: 'ballas', description: 'Установить роль для Ballas' },
    { name: 'marabunta', description: 'Установить роль для Marabunta' },
    { name: 'famillies', description: 'Установить роль для Famillies' },
    { name: 'bloods', description: 'Установить роль для Bloods' },
    { name: 'moders', description: 'Установить роль для Moders' },
    { name: 'revive', description: 'Установить роль для Revive' },
    { name: 'managment', description: 'Установить роль для Management' },
    { name: 'lider', description: 'Установить роль для уведомлений об откате' }
];

module.exports = factions.map(faction => ({
    data: new SlashCommandBuilder()
        .setName(`уро${faction.name}`)
        .setDescription(faction.description)
        .addRoleOption(option =>
            option.setName('роль')
                .setDescription(`Роль для ${faction.name}`)
                .setRequired(true)),

    async execute(interaction, state) {
        try {
            const role = interaction.options.getRole('роль');
            state.rolesManager.setRole(faction.name, role.id);
            // Сохраняем конфигурацию после установки роли
            state.saveConfig();

            await interaction.reply({
                content: `Роль для ${faction.name} успешно установлена: ${role.name}`,
                flags: [1 << 6]
            });
        } catch (error) {
            console.error(`Ошибка установки роли для ${faction.name}:`, error);
            await interaction.reply({
                content: `Произошла ошибка при установке роли для ${faction.name}`,
                flags: [1 << 6]
            });
        }
    }
}));
