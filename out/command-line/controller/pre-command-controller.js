"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreCommandController = exports.PreCommandValidationError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class PreCommandValidationError extends cli_shared_1.UserError {
    constructor() {
        super(cli_shared_1.Text.config.manifest.invalid);
    }
}
exports.PreCommandValidationError = PreCommandValidationError;
class PreCommandController {
    constructor(service, view, configReader, cachedConfigService, analyticsSettingsView, settingsView) {
        this.service = service;
        this.view = view;
        this.configReader = configReader;
        this.cachedConfigService = cachedConfigService;
        this.analyticsSettingsView = analyticsSettingsView;
        this.settingsView = settingsView;
    }
    async runChecks(strict) {
        const report = await this.service.run(strict, this.view.getLogger());
        if (this.service.hasErrors(report)) {
            this.view.reportErrors(report);
            throw new PreCommandValidationError();
        }
    }
    verifyManifestExists() {
        return async () => this.runChecks(false);
    }
    verifyManifestExistsWithAppConfig() {
        return async () => {
            await this.runChecks(true);
            const config = await this.configReader.readConfig();
            return {
                appId: config.app.id
            };
        };
    }
    verifyAnalyticsPreferences(nonInteractive = false) {
        return async () => {
            const preference = this.cachedConfigService.getAnalyticsPreferences();
            if (preference === undefined) {
                if (nonInteractive) {
                    throw new cli_shared_1.ValidationError(cli_shared_1.Text.nonInteractive.error.missingAnalyticsPreferences);
                }
                const selectedPreference = await this.analyticsSettingsView.promptForPreference();
                this.cachedConfigService.setAnalyticsPreferences(selectedPreference);
                this.settingsView.setSuccess('usage-analytics', selectedPreference.toString());
                return selectedPreference;
            }
            else {
                return preference;
            }
        };
    }
}
exports.PreCommandController = PreCommandController;
