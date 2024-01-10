"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsSettingsView = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const ANALYTICS_TRUE = 'Yes';
const ANALYTICS_FALSE = 'No';
class AnalyticsSettingsView {
    constructor(ui) {
        this.ui = ui;
    }
    async promptForPreference() {
        this.ui.info(cli_shared_1.Text.settings.analytics.banner);
        this.ui.emptyLine();
        const value = await this.ui.promptForList(cli_shared_1.Text.settings.analytics.promptMessage, [ANALYTICS_TRUE, ANALYTICS_FALSE]);
        return value === ANALYTICS_TRUE;
    }
}
exports.AnalyticsSettingsView = AnalyticsSettingsView;
