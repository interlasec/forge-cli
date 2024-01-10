"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const settings_controller_1 = require("./controller/settings-controller");
const COMMAND_NAME = 'settings';
const SHOW_COMMAND_NAME = 'list';
const SET_COMMAND_NAME = 'set <setting> <boolean|string>';
const registerSettingsList = ({ cmd, controllers: { settingsController } }) => {
    cmd
        .command(SHOW_COMMAND_NAME)
        .description(cli_shared_1.Text.settings.list.description)
        .requireNoAuthentication()
        .requireNoAnalyticsConsent()
        .jsonOption()
        .action(async ({ json }) => {
        await settingsController.showSettings(json);
        return { analytics: {} };
    });
};
const registerSettingsSet = ({ cmd, controllers: { settingsController } }) => {
    cmd
        .command(SET_COMMAND_NAME)
        .description(cli_shared_1.Text.settings.set.description(settings_controller_1.ALLOWED_SETTINGS))
        .requireNoAuthentication()
        .requireNoAnalyticsConsent()
        .action(async (preference, value) => {
        await settingsController.setSetting(preference, value);
        return { analytics: {} };
    });
};
const registerCommands = (_a) => {
    var { cmd } = _a, deps = tslib_1.__rest(_a, ["cmd"]);
    const preferences = cmd.command(COMMAND_NAME).requireNoAuthentication().description(cli_shared_1.Text.settings.description);
    registerSettingsList(Object.assign({ cmd: preferences }, deps));
    registerSettingsSet(Object.assign({ cmd: preferences }, deps));
};
exports.registerCommands = registerCommands;
