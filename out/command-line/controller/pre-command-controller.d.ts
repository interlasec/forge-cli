import { LiteLintService } from '../../service/lite-lint-service';
import { LiteLintView } from '../view/lite-lint-view';
import { ConfigReader, UserError } from '@forge/cli-shared';
import { CachedConfigService } from '../../service/cached-config-service';
import { AnalyticsSettingsView } from '../view/analytics-settings-view';
import { SettingsView } from '../view/settings-view';
export declare class PreCommandValidationError extends UserError {
    constructor();
}
export declare class PreCommandController {
    private readonly service;
    private readonly view;
    private readonly configReader;
    private readonly cachedConfigService;
    private readonly analyticsSettingsView;
    private readonly settingsView;
    constructor(service: LiteLintService, view: LiteLintView, configReader: ConfigReader, cachedConfigService: CachedConfigService, analyticsSettingsView: AnalyticsSettingsView, settingsView: SettingsView);
    private runChecks;
    verifyManifestExists(): () => Promise<void>;
    verifyManifestExistsWithAppConfig(): () => Promise<{
        appId?: string;
    }>;
    verifyAnalyticsPreferences(nonInteractive?: boolean): () => Promise<boolean>;
}
//# sourceMappingURL=pre-command-controller.d.ts.map