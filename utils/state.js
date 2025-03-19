const RolesManager = require('./roles');
const fs = require('fs');
const path = require('path');

class BotState {
    constructor() {
        this.configPath = path.join(__dirname, '../config.json');
        this.deliveryChannelId = null;
        this.reportChannelId = null;
        this.rollbackChannelId = null;
        this.deliveryTag = null;
        this.webhookUrl = null;
        this.deliveries = new Map();
        this.rolesManager = new RolesManager();
        this.rollbackRequests = new Map();
        
        // Загружаем сохраненные настройки при создании экземпляра
        this.loadConfig();
    }

    // Загрузка конфигурации из файла
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                // Сохраняем только ID каналов
                this.deliveryChannelId = data.deliveryChannelId;
                this.reportChannelId = data.reportChannelId;
                this.rollbackChannelId = data.rollbackChannelId;
                this.deliveryTag = data.deliveryTag;
                this.webhookUrl = data.webhookUrl;
                console.log('Конфигурация успешно загружена');
            }
        } catch (error) {
            console.error('Ошибка при загрузке конфигурации:', error);
        }
    }

    // Сохранение конфигурации в файл
    saveConfig() {
        try {
            const config = {
                deliveryChannelId: this.deliveryChannelId,
                reportChannelId: this.reportChannelId,
                rollbackChannelId: this.rollbackChannelId,
                deliveryTag: this.deliveryTag,
                webhookUrl: this.webhookUrl
            };
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            console.log('Конфигурация успешно сохранена');
        } catch (error) {
            console.error('Ошибка при сохранении конфигурации:', error);
        }
    }

    setDeliveryChannel(channel) {
        this.deliveryChannelId = channel.id;
        this.saveConfig();
    }

    setReportChannel(channel) {
        this.reportChannelId = channel.id;
        this.saveConfig();
    }

    setRollbackChannel(channel) {
        this.rollbackChannelId = channel.id;
        this.saveConfig();
    }

    setDeliveryTag(tag) {
        this.deliveryTag = tag;
        this.saveConfig();
    }

    setWebhookUrl(url) {
        this.webhookUrl = url;
        this.saveConfig();
    }

    // Сохраняет создателя поставки
    addDelivery(messageId, creator) {
        this.deliveries.set(messageId, { creator, factionMember: null });
    }

    // Сохраняет пользователя, выбравшего фракцию
    setDeliveryFaction(messageId, factionMember) {
        const delivery = this.deliveries.get(messageId);
        if (delivery) {
            delivery.factionMember = factionMember;
        }
    }

    // Получает информацию об участниках поставки
    getDeliveryParticipants(messageId) {
        return this.deliveries.get(messageId);
    }

    // Методы для запросов отката
    setRollbackRequest(userId, request) {
        this.rollbackRequests.set(userId, request);
    }

    getRollbackRequest(userId) {
        return this.rollbackRequests.get(userId);
    }

    clearRollbackRequest(userId) {
        this.rollbackRequests.delete(userId);
    }
}

module.exports = BotState;
