import { CachedConfigService } from '../../service/cached-config-service';
import { SettingsView } from '../view/settings-view';
import { AppConfigProvider } from '@forge/cli-shared';
export declare const ALLOWED_SETTINGS: readonly ["usage-analytics", "ngrok-config-path", "default-environment"];
export declare class SettingsController {
    private readonly settingsView;
    private readonly cachedConfigService;
    private readonly getAppConfig;
    constructor(settingsView: SettingsView, cachedConfigService: CachedConfigService, getAppConfig: AppConfigProvider);
    private SETTINGS_MAP;
    private parseBoolean;
    private isAllowedSetting;
    showSettings(json?: boolean): Promise<void>;
    setSetting(preference: string, value: string): Promise<void>;
}
//# sourceMappingURL=settings-controller.d.ts.map