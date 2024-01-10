"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsMessageWorker = void 0;
class AnalyticsMessageWorker {
    constructor(storage, messageHandler, cachedConfigService) {
        this.storage = storage;
        this.messageHandler = messageHandler;
        this.cachedConfigService = cachedConfigService;
    }
    async doWork() {
        const analyticsSetting = this.cachedConfigService.getAnalyticsPreferences();
        if (analyticsSetting === undefined) {
            return;
        }
        try {
            const events = this.storage.getAnalytics();
            await Promise.all(events.map(async (event) => {
                const payload = await this.storage.getAnalyticsEvent(event);
                if (analyticsSetting) {
                    await this.messageHandler.handleMessage(payload);
                }
                await this.storage.deleteAnalyticsEvent(event);
            }));
        }
        catch (e) {
        }
    }
}
exports.AnalyticsMessageWorker = AnalyticsMessageWorker;
