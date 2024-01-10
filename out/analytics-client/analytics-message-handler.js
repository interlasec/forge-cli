"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsMessageHandler = exports.EventType = void 0;
const analytics_node_client_1 = require("@forge/util/packages/analytics-node-client");
var EventType;
(function (EventType) {
    EventType["TRACK"] = "track";
    EventType["OPERATIONAL"] = "operational";
    EventType["UI"] = "ui";
})(EventType = exports.EventType || (exports.EventType = {}));
class AnalyticsMessageHandler {
    constructor(environment) {
        this.environment = environment;
        this.aClient = (0, analytics_node_client_1.analyticsClient)({
            env: this.environment || 'prod',
            product: 'forge',
            subproduct: 'cli',
            flushAt: 1,
            flushInterval: 1
        });
        this.handleMessage = async (message) => {
            if (!message) {
                return;
            }
            try {
                switch (message.eventType) {
                    case EventType.TRACK:
                        await this.aClient.sendTrackEvent(message.event);
                        break;
                    case EventType.OPERATIONAL:
                        await this.aClient.sendOperationalEvent(message.event);
                        break;
                    case EventType.UI:
                        await this.aClient.sendUIEvent(message.event);
                        break;
                }
            }
            catch (e) {
            }
        };
    }
}
exports.AnalyticsMessageHandler = AnalyticsMessageHandler;
