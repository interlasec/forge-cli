"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = exports.ALLOWED_SETTINGS = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const manifest_1 = require("@forge/manifest");
const environment_1 = require("../environment");
exports.ALLOWED_SETTINGS = ['usage-analytics', 'ngrok-config-path', 'default-environment'];
class SettingsController {
    constructor(settingsView, cachedConfigService, getAppConfig) {
        this.settingsView = settingsView;
        this.cachedConfigService = cachedConfigService;
        this.getAppConfig = getAppConfig;
        this.SETTINGS_MAP = {
            'usage-analytics': {
                description: cli_shared_1.Text.settings.usageAnalytics.description,
                get: async () => this.cachedConfigService.getAnalyticsPreferences(),
                set: async (value) => {
                    const parsedValue = this.parseBoolean(value);
                    this.cachedConfigService.setAnalyticsPreferences(parsedValue);
                }
            },
            'ngrok-config-path': {
                description: cli_shared_1.Text.settings.ngrokConfig.description,
                get: async () => this.cachedConfigService.getNgrokConfigPath(),
                set: async (value) => this.cachedConfigService.setNgrokConfigPath(value)
            },
            'default-environment': {
                description: cli_shared_1.Text.settings.defaultEnvironment.description,
                get: async () => {
                    try {
                        const { id: appId } = await this.getAppConfig();
                        const environment = this.cachedConfigService.getDefaultEnvironment(appId);
                        return environment ? (0, cli_shared_1.environmentToOption)(environment) : environment;
                    }
                    catch (e) {
                        if (e instanceof cli_shared_1.InvalidManifestError) {
                            return;
                        }
                        throw e;
                    }
                },
                set: async (value) => {
                    (0, environment_1.validateDevEnvironment)(value);
                    const environment = (0, environment_1.checkEnvironmentOption)(value);
                    try {
                        const { id: appId } = await this.getAppConfig();
                        this.cachedConfigService.setDefaultEnvironment(appId, environment);
                    }
                    catch (e) {
                        if (e instanceof cli_shared_1.InvalidManifestError) {
                            throw new cli_shared_1.ValidationError(manifest_1.errors.missingManifest());
                        }
                        throw e;
                    }
                },
                getDisplayValue: (value) => cli_shared_1.Text.env.displayEnvironment(value, cli_shared_1.AppEnvironmentType.Development),
                additionalInfo: cli_shared_1.Text.settings.defaultEnvironment.info
            }
        };
    }
    parseBoolean(value) {
        switch (value) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                throw new cli_shared_1.ValidationError(cli_shared_1.Text.settings.set.invalidValue);
        }
    }
    isAllowedSetting(preference) {
        return exports.ALLOWED_SETTINGS.includes(preference);
    }
    async showSettings(json) {
        const settings = [];
        for (const settingName of exports.ALLOWED_SETTINGS) {
            const setting = this.SETTINGS_MAP[settingName];
            settings.push([settingName, setting.description, await setting.get()]);
        }
        this.settingsView.showSettings(settings, json);
    }
    async setSetting(preference, value) {
        if (!this.isAllowedSetting(preference)) {
            throw new cli_shared_1.ValidationError(cli_shared_1.Text.settings.set.invalidSetting(exports.ALLOWED_SETTINGS));
        }
        const setting = this.SETTINGS_MAP[preference];
        await setting.set(value);
        if (setting.additionalInfo) {
            this.settingsView.showAdditionalInfo(setting.additionalInfo);
        }
        const displayValue = setting.getDisplayValue ? setting.getDisplayValue(value) : value;
        this.settingsView.setSuccess(preference, displayValue);
    }
}
exports.SettingsController = SettingsController;
