import { OperationalEvent, TrackEvent, UIEvent } from '@forge/util/packages/analytics-node-client';
export declare enum EventType {
    TRACK = "track",
    OPERATIONAL = "operational",
    UI = "ui"
}
export interface AnalyticsMessage {
    id: string;
    eventType: EventType;
    event: UIEvent | TrackEvent | OperationalEvent;
}
export interface MessageHandler<T> {
    handleMessage(message: T): Promise<void>;
}
export declare class AnalyticsMessageHandler implements MessageHandler<AnalyticsMessage> {
    private readonly environment?;
    constructor(environment?: string | undefined);
    private readonly aClient;
    handleMessage: (message: AnalyticsMessage | undefined) => Promise<void>;
}
//# sourceMappingURL=analytics-message-handler.d.ts.map