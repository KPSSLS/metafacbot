const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const https = require('https');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, state) {
        // Проверяем, что команда выполняется на сервере
        if (!interaction.guild) {
            await interaction.reply({ 
                content: 'Команды доступны только на сервере!',
                ephemeral: true
            });
            return;
        }

        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, state);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: 'При выполнении команды произошла ошибка!',
                    flags: [1 << 6]
                });
            }
            return;
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'delivery-modal') {
                const date = interaction.fields.getTextInputValue('date');
                const time = interaction.fields.getTextInputValue('time');
                const driver = interaction.fields.getTextInputValue('driver');

                if (!state.deliveryChannelId) {
                    await interaction.reply({ 
                        content: 'Канал для поставок не установлен! Используйте /уканалпоставок',
                        flags: [1 << 6]
                    });
                    return;
                }

                const deliveryChannel = await interaction.client.channels.fetch(state.deliveryChannelId);
                if (!deliveryChannel) {
                    await interaction.reply({ 
                        content: 'Не удалось найти канал для поставок! Возможно, он был удален.',
                        flags: [1 << 6]
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle('🚛 Новая поставка')
                    .setColor('#FF5733')
                    .addFields(
                        { 
                            name: '📅 Дата',
                            value: `\`${date}\``,
                            inline: true
                        },
                        { 
                            name: '⏰ Время',
                            value: `\`${time}\``,
                            inline: true
                        },
                        { 
                            name: '\u200B',
                            value: '\u200B',
                            inline: true
                        },
                        { 
                            name: '🚚 Водитель',
                            value: `\`${driver}\``,
                            inline: true
                        },
                        { 
                            name: '🎯 Перехват',
                            value: '\`Не выбрано\`',
                            inline: true
                        }
                    )
                    .setTimestamp()
                    .setFooter({ 
                        text: 'Meta Delivery System',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('vagos')
                            .setLabel('Vagos')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🟨'),
                        new ButtonBuilder()
                            .setCustomId('ballas')
                            .setLabel('Ballas')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🟪'),
                        new ButtonBuilder()
                            .setCustomId('marabunta')
                            .setLabel('Marabunta')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🟦'),
                        new ButtonBuilder()
                            .setCustomId('famillies')
                            .setLabel('Famillies')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🟩'),
                        new ButtonBuilder()
                            .setCustomId('bloods')
                            .setLabel('Bloods')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🟥')
                    );

                const reportButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('report')
                            .setLabel('Оставить отчет')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('📝')
                    );

                // Отправляем сообщение в канал Discord
                const deliveryMessage = await deliveryChannel.send({
                    content: state.deliveryTag ? state.deliveryTag : '',
                    embeds: [embed],
                    components: [buttons, reportButton]
                });

                // Сохраняем создателя поставки
                console.log('Сохраняем создателя поставки:', interaction.user.tag);
                state.addDelivery(deliveryMessage.id, interaction.user);

                // Если установлен вебхук, отправляем сообщение через него
                if (state.webhookUrl) {
                    try {
                        const webhookBody = {
                            embeds: [embed.toJSON()],
                            username: 'Meta Delivery System',
                            avatar_url: interaction.client.user.displayAvatarURL()
                        };

                        const data = JSON.stringify(webhookBody);
                        const webhookUrlObj = new URL(state.webhookUrl);

                        const options = {
                            hostname: webhookUrlObj.hostname,
                            path: webhookUrlObj.pathname + webhookUrlObj.search,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(data)
                            }
                        };

                        const req = https.request(options, (res) => {
                            let responseData = '';
                            res.on('data', (chunk) => {
                                responseData += chunk;
                            });
                            res.on('end', () => {
                                if (res.statusCode !== 204) {
                                    console.error('Ошибка при отправке вебхука:', res.statusCode, responseData);
                                }
                            });
                        });

                        req.on('error', (error) => {
                            console.error('Ошибка при отправке вебхука:', error);
                        });

                        req.write(data);
                        req.end();
                    } catch (error) {
                        console.error('Ошибка при отправке вебхука:', error);
                    }
                }

                await interaction.reply({ 
                    content: 'Поставка создана!',
                    flags: [1 << 6]
                });
                return;
            }

            if (interaction.customId === 'report-modal') {
                const result = interaction.fields.getTextInputValue('result');
                const mats = interaction.fields.getTextInputValue('mats');
                const video = interaction.fields.getTextInputValue('video');

                if (!state.reportChannelId) {
                    await interaction.reply({ 
                        content: 'Канал для отчетов не установлен! Используйте /уканалотчетапоставок',
                        flags: [1 << 6]
                    });
                    return;
                }

                const reportChannel = await interaction.client.channels.fetch(state.reportChannelId);
                if (!reportChannel) {
                    await interaction.reply({ 
                        content: 'Не удалось найти канал для отчетов! Возможно, он был удален.',
                        flags: [1 << 6]
                    });
                    return;
                }

                const originalEmbed = interaction.message.embeds[0];
                const reportEmbed = new EmbedBuilder()
                    .setTitle('📊 Отчет о поставке')
                    .setColor('#00FF00')
                    .setDescription('Итоги поставки:')
                    .addFields(
                        { 
                            name: '📅 Дата',
                            value: originalEmbed.fields[0].value,
                            inline: true
                        },
                        { 
                            name: '⏰ Время',
                            value: originalEmbed.fields[1].value,
                            inline: true
                        },
                        { 
                            name: '\u200B',
                            value: '\u200B',
                            inline: true
                        },
                        { 
                            name: '🚚 Водитель',
                            value: originalEmbed.fields[3].value,
                            inline: true
                        },
                        { 
                            name: '🎯 Перехват',
                            value: originalEmbed.fields[4].value,
                            inline: true
                        },
                        { 
                            name: '\u200B',
                            value: '\u200B',
                            inline: true
                        },
                        { 
                            name: '📝 Результат',
                            value: `\`${result}\``,
                            inline: true
                        },
                        { 
                            name: '📦 Материалы',
                            value: `\`${mats}\``,
                            inline: true
                        },
                        { 
                            name: '\u200B',
                            value: '\u200B',
                            inline: true
                        }
                    );

                if (video) {
                    reportEmbed.addFields({
                        name: '🎥 Видео',
                        value: video,
                        inline: false
                    });
                }

                reportEmbed.setTimestamp()
                    .setFooter({ 
                        text: 'Meta Delivery System',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });

                // Создаем кнопку отката
                const rollbackButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('rollback')
                            .setLabel('Запросить откат')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🎥')
                    );

                // Отправляем отчет
                const reportMessage = await reportChannel.send({
                    embeds: [reportEmbed],
                    components: [rollbackButton]
                });

                // Сохраняем сообщение для возможного отката
                state.addReport(reportMessage.id, {
                    messageId: interaction.message.id,
                    embed: reportEmbed
                });

                await interaction.update({
                    content: 'Отчет отправлен!',
                    components: []
                });

                // Удаляем сообщение после отправки отчета
                await interaction.message.delete();
                return;
            }
        }

        if (interaction.isButton()) {
            // Обработка кнопок выбора роли
            if (interaction.customId.startsWith('role-')) {
                try {
                    const factionId = interaction.customId.replace('role-', '');
                    const roleId = state.rolesManager.getRole(factionId);

                    if (!roleId) {
                        await interaction.reply({
                            content: `Роль для ${factionId} не настроена.`,
                            ephemeral: true
                        });
                        return;
                    }

                    const role = await interaction.guild.roles.fetch(roleId);
                    if (!role) {
                        await interaction.reply({
                            content: `Не удалось найти роль для ${factionId}.`,
                            ephemeral: true
                        });
                        return;
                    }

                    const member = interaction.member;
                    const hasRole = member.roles.cache.has(roleId);

                    // Получаем все роли фракций из менеджера ролей
                    const allFactionRoleIds = Array.from(state.rolesManager.getAllRoles().values());

                    if (hasRole) {
                        // Если у пользователя уже есть эта роль - удаляем её
                        await member.roles.remove(roleId);
                        await interaction.reply({
                            content: `Роль ${role.name} удалена`,
                            ephemeral: true
                        });
                    } else {
                        // Проверяем наличие других ролей фракций
                        const memberRoles = member.roles.cache;
                        const existingFactionRoles = memberRoles.filter(r => allFactionRoleIds.includes(r.id));

                        if (existingFactionRoles.size > 0) {
                            await interaction.reply({
                                content: 'Сначала нужно убрать текущую роль фракции',
                                ephemeral: true
                            });
                            return;
                        }

                        // Выдаём новую роль
                        await member.roles.add(roleId);
                        await interaction.reply({
                            content: `Выдана роль ${role.name}`,
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Ошибка при управлении ролями:', error);
                    await interaction.reply({
                        content: 'Произошла ошибка при управлении ролями',
                        ephemeral: true
                    });
                }
                return;
            }

            // Обработка кнопок выбора банды
            const factions = ['vagos', 'ballas', 'marabunta', 'famillies', 'bloods'];
            if (factions.includes(interaction.customId)) {
                const faction = interaction.customId;
                const roleId = state.rolesManager.getRole(faction);
                
                if (!roleId) {
                    await interaction.reply({
                        content: `Роль для ${faction} не установлена! Используйте /уро${faction}`,
                        flags: [1 << 6]
                    });
                    return;
                }

                const role = await interaction.guild.roles.fetch(roleId);
                if (!role) {
                    await interaction.reply({
                        content: `Не удалось найти роль для ${faction}`,
                        flags: [1 << 6]
                    });
                    return;
                }

                // Обновляем embed с информацией о перехвате
                const message = interaction.message;
                const embed = EmbedBuilder.from(message.embeds[0]);
                
                // Находим поле с перехватом и обновляем его
                const interceptField = embed.data.fields.find(field => field.name === '🎯 Перехват');
                if (interceptField) {
                    interceptField.value = `\`${role.name}\``;
                }

                // Отключаем все кнопки выбора фракции
                const buttons = message.components[0];
                const reportButton = message.components[1];
                
                const disabledButtons = new ActionRowBuilder();
                buttons.components.forEach(button => {
                    const newButton = ButtonBuilder.from(button);
                    if (button.customId === interaction.customId) {
                        newButton.setDisabled(false);
                    } else {
                        newButton.setDisabled(true);
                    }
                    disabledButtons.addComponents(newButton);
                });

                await interaction.update({
                    embeds: [embed],
                    components: [disabledButtons, reportButton]
                });
                return;
            }

            // Обработка кнопки отчета
            if (interaction.customId === 'report') {
                const modal = new ModalBuilder()
                    .setCustomId('report-modal')
                    .setTitle('Отчет о поставке');

                const resultInput = new TextInputBuilder()
                    .setCustomId('result')
                    .setLabel('Результат')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Успешно/Неуспешно')
                    .setRequired(true);

                const matsInput = new TextInputBuilder()
                    .setCustomId('mats')
                    .setLabel('Материалы')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Количество материалов')
                    .setRequired(true);

                const videoInput = new TextInputBuilder()
                    .setCustomId('video')
                    .setLabel('Видео')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ссылка на видео (необязательно)')
                    .setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(resultInput),
                    new ActionRowBuilder().addComponents(matsInput),
                    new ActionRowBuilder().addComponents(videoInput)
                );

                await interaction.showModal(modal);
                return;
            }

            // Обработка кнопки отката
            if (interaction.customId === 'rollback') {
                try {
                    const reportData = state.getReport(interaction.message.id);
                    if (!reportData) {
                        await interaction.reply({
                            content: 'Не удалось найти информацию о поставке для отката.',
                            flags: [1 << 6]
                        });
                        return;
                    }

                    // Создаем кнопку подтверждения отката
                    const confirmButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm-rollback')
                                .setLabel('Подтвердить запрос отката')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('✅')
                        );

                    await interaction.reply({
                        content: 'Вы уверены, что хотите запросить откат? Нажмите кнопку ниже для подтверждения.',
                        components: [confirmButton],
                        flags: [1 << 6]
                    });
                    return;
                } catch (error) {
                    console.error('Ошибка при обработке запроса отката:', error);
                    await interaction.reply({
                        content: 'Произошла ошибка при обработке запроса отката.',
                        flags: [1 << 6]
                    });
                    return;
                }
            }

            // Обработка кнопки подтверждения отката
            if (interaction.customId === 'confirm-rollback') {
                try {
                    const reportData = state.getReport(interaction.message.reference?.messageId);
                    if (!reportData) {
                        await interaction.reply({
                            content: 'Не удалось найти информацию о поставке для отката.',
                            flags: [1 << 6]
                        });
                        return;
                    }

                    // Проверяем, есть ли канал для откатов
                    if (!state.rollbackChannelId) {
                        await interaction.reply({
                            content: 'Канал для откатов не установлен! Используйте команду для установки канала откатов.',
                            flags: [1 << 6]
                        });
                        return;
                    }

                    const rollbackChannel = await interaction.client.channels.fetch(state.rollbackChannelId);
                    if (!rollbackChannel) {
                        await interaction.reply({
                            content: 'Не удалось найти канал для откатов! Возможно, он был удален.',
                            flags: [1 << 6]
                        });
                        return;
                    }

                    // Получаем роль лидера
                    const liderRoleId = state.rolesManager.getRole('lider');
                    const liderRole = liderRoleId ? await interaction.guild.roles.fetch(liderRoleId) : null;
                    const roleMention = liderRole ? `${liderRole}` : '@everyone';

                    // Сохраняем запрос отката
                    state.addRollbackRequest(interaction.user.id, {
                        messageId: reportData.messageId,
                        embed: reportData.embed
                    });

                    // Отправляем сообщение в канал откатов
                    await rollbackChannel.send({
                        content: `${roleMention} Новый запрос отката от ${interaction.user}`,
                        embeds: [reportData.embed]
                    });

                    await interaction.update({
                        content: 'Запрос отката отправлен!',
                        components: []
                    });
                    return;
                } catch (error) {
                    console.error('Ошибка при обработке подтверждения отката:', error);
                    await interaction.reply({
                        content: 'Произошла ошибка при обработке подтверждения отката.',
                        flags: [1 << 6]
                    });
                    return;
                }
            }
        }
    }
};
