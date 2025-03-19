const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const https = require('https');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, state) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, state);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: 'При выполнении команды произошла ошибка!',
                    ephemeral: true
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
                        ephemeral: true
                    });
                    return;
                }

                const deliveryChannel = await interaction.client.channels.fetch(state.deliveryChannelId);
                if (!deliveryChannel) {
                    await interaction.reply({ 
                        content: 'Не удалось найти канал для поставок! Возможно, он был удален.',
                        ephemeral: true
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle('🚛 Новая поставка')
                    .setColor('#FF5733')
                    .setDescription(state.deliveryTag ? state.deliveryTag.toString() : ' ')
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
                    ephemeral: true
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
                        ephemeral: true
                    });
                    return;
                }

                const reportChannel = await interaction.client.channels.fetch(state.reportChannelId);
                if (!reportChannel) {
                    await interaction.reply({ 
                        content: 'Не удалось найти канал для отчетов! Возможно, он был удален.',
                        ephemeral: true
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
                return;
            }
        }

        if (interaction.isButton()) {
            // Обработка кнопок выбора роли
            if (interaction.customId.startsWith('role-')) {
                try {
                    const factionId = interaction.customId.replace('role-', '');
                    console.log('Запрошена роль для фракции:', factionId);
                    
                    const roleId = state.rolesManager.getRole(factionId);
                    console.log('Найден ID роли:', roleId);

                    if (!roleId) {
                        console.log('Роль не настроена для фракции:', factionId);
                        await interaction.reply({
                            content: `Роль для ${factionId} не настроена. Сначала настройте роль командой /уро${factionId}`,
                            ephemeral: true
                        });
                        return;
                    }

                    const role = await interaction.guild.roles.fetch(roleId);
                    console.log('Получена роль из Discord:', role?.name || 'не найдена');
                    
                    if (!role) {
                        await interaction.reply({
                            content: `Не удалось найти роль для ${factionId}. Проверьте, что роль существует на сервере и настройте её заново командой /уро${factionId}`,
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем права бота
                    const bot = interaction.guild.members.cache.get(interaction.client.user.id);
                    if (!bot.permissions.has('ManageRoles')) {
                        await interaction.reply({
                            content: 'У бота нет прав на управление ролями. Обратитесь к администратору сервера.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем позицию роли бота
                    const botRole = bot.roles.highest;
                    if (botRole.position <= role.position) {
                        await interaction.reply({
                            content: 'Роль бота должна быть выше выдаваемой роли в списке ролей сервера. Обратитесь к администратору.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем, есть ли уже эта роль у пользователя
                    if (interaction.member.roles.cache.has(roleId)) {
                        // Если роль уже есть, удаляем её
                        await interaction.member.roles.remove(roleId);
                        await interaction.reply({
                            content: `Роль ${role.name} была убрана.`,
                            ephemeral: true
                        });
                    } else {
                        // Если роли нет, добавляем её
                        await interaction.member.roles.add(roleId);
                        await interaction.reply({
                            content: `Вы получили роль ${role.name}!`,
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Ошибка при выдаче роли:', error);
                    await interaction.reply({
                        content: 'Произошла ошибка при выдаче роли. Проверьте права бота и позицию ролей на сервере.',
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
                        ephemeral: true
                    });
                    return;
                }

                const role = await interaction.guild.roles.fetch(roleId);
                if (!role) {
                    await interaction.reply({
                        content: `Не удалось найти роль для ${faction}`,
                        ephemeral: true
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

                await interaction.update({
                    embeds: [embed],
                    components: message.components
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
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем, есть ли канал для откатов
                    if (!state.rollbackChannelId) {
                        await interaction.reply({
                            content: 'Канал для откатов не установлен! Используйте команду для установки канала откатов.',
                            ephemeral: true
                        });
                        return;
                    }

                    const rollbackChannel = await interaction.client.channels.fetch(state.rollbackChannelId);
                    if (!rollbackChannel) {
                        await interaction.reply({
                            content: 'Не удалось найти канал для откатов! Возможно, он был удален.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем роль модератора
                    const modRoleId = state.rolesManager.getRole('moders');
                    if (!modRoleId) {
                        await interaction.reply({
                            content: 'Роль модератора не установлена! Используйте /уроmoders',
                            ephemeral: true
                        });
                        return;
                    }

                    const modRole = await interaction.guild.roles.fetch(modRoleId);
                    if (!modRole) {
                        await interaction.reply({
                            content: 'Не удалось найти роль модератора',
                            ephemeral: true
                        });
                        return;
                    }

                    // Проверяем, есть ли у пользователя роль модератора
                    if (!interaction.member.roles.cache.has(modRoleId)) {
                        await interaction.reply({
                            content: 'У вас нет прав для запроса отката!',
                            ephemeral: true
                        });
                        return;
                    }

                    // Сохраняем запрос отката
                    state.addRollbackRequest(interaction.user.id, {
                        messageId: interaction.message.id,
                        embed: reportData.embed
                    });

                    // Отправляем сообщение в канал откатов
                    const rollbackMessage = `${modRole} Куратор ${interaction.user} запрашивает видео откат с поставки. Предоставьте его в личные сообщения куратору!`;
                    
                    await rollbackChannel.send({
                        content: rollbackMessage,
                        embeds: [reportData.embed]
                    });

                    // Отключаем кнопку отката в оригинальном сообщении
                    const message = await interaction.message.fetch();
                    if (message.components && message.components.length > 0) {
                        const disabledButton = ButtonBuilder.from(message.components[0].components[0])
                            .setDisabled(true);

                        await message.edit({
                            embeds: message.embeds,
                            components: [new ActionRowBuilder().addComponents(disabledButton)]
                        });
                    }

                    // Отправляем подтверждение
                    await interaction.reply({
                        content: `Запрос на откат отправлен в канал ${rollbackChannel}!`,
                        ephemeral: true
                    });

                    // Очищаем запрос отката
                    state.clearRollbackRequest(interaction.user.id);

                } catch (error) {
                    console.error('Ошибка отправки запроса отката:', error);
                    await interaction.reply({
                        content: 'Произошла ошибка при отправке запроса отката.',
                        ephemeral: true
                    });
                }
                return;
            }
        }
    }
};
