import { PersonalApiCredentialsValidated, Logger } from '@forge/cli-shared';
import { Storage } from '../storage/local-file-storage';
import { CachedConfigService } from '../service/cached-config-service';
import { DeferredErrors } from '../command-line/errors';
export declare type AttributeMapper<T> = (val: T) => T | undefined;
export declare class AnalyticsClientReporter {
    private readonly storage;
    private readonly logger;
    private readonly configService;
    constructor(storage: Storage, logger: Logger, configService: CachedConfigService);
    private readonly source;
    reportSuccess(cmdName: string, cred: PersonalApiCredentialsValidated | string, attributes: {
        [key: string]: any;
    }): void;
    reportFailure(cmdName: string, cred: string | PersonalApiCredentialsValidated, attributes: {
        [key: string]: any;
    }, e: Error): void;
    reportCommandInvoke(cmdName: string, cred: string | PersonalApiCredentialsValidated, attributes: {
        [key: string]: any;
    }): void;
    reportInvokeFailure(cmdName: string, cred: string | PersonalApiCredentialsValidated, attributes: {
        [key: string]: any;
    }, e?: Error | DeferredErrors): void;
    private reportOperationalEvent;
    private processAnalyticsEvent;
    private _getUserId;
    private _getErrorDetails;
    private _getErrorListDetails;
    private _asContainer;
    private _nodeVersion;
    private _machineId;
    private _asAttribute;
    private _getAttributes;
    private _getContainer;
}
//# sourceMappingURL=analytics-client.d.ts.map