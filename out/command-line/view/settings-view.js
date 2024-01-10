"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsView = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class SettingsView {
    constructor(ui) {
        this.ui = ui;
    }
    showSettings(preferences, json) {
        this.ui.table([
            ['setting', 'Setting'],
            ['description', 'Description'],
            ['value', 'Value']
        ], preferences.map(([preference, desc, value]) => ({ setting: preference, description: desc, value })), {
            json,
            format: {
                value: (value) => (value === undefined ? 'Not set' : String(value))
            }
        });
    }
    showAdditionalInfo(message) {
        this.ui.emptyLine();
        this.ui.info(message);
        this.ui.emptyLine();
    }
    setSuccess(setting, value) {
        this.ui.info(cli_shared_1.Text.settings.set.success(setting, value));
        this.ui.emptyLine();
    }
}
exports.SettingsView = SettingsView;
