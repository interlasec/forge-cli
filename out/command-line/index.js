"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const dependency_injection_1 = require("./dependency-injection");
const version_info_1 = require("./version-info");
const register_app_commands_1 = require("./register-app-commands");
const register_authentication_command_1 = require("./register-authentication-command");
const register_autocomplete_commands_1 = require("./register-autocomplete-commands");
const register_deployment_commands_1 = require("./register-deployment-commands");
const register_environment_variables_commands_1 = require("./register-environment-variables-commands");
const register_installation_commands_1 = require("./register-installation-commands");
const register_lint_command_1 = require("./register-lint-command");
const register_log_commands_1 = require("./register-log-commands");
const register_tunnel_commands_1 = require("./register-tunnel-commands");
const register_webtrigger_commands_1 = require("./register-webtrigger-commands");
const register_feedback_commands_1 = require("./register-feedback-commands");
const register_settings_commands_1 = require("./register-settings-commands");
const register_providers_commands_1 = require("./register-providers-commands");
const register_environments_commands_1 = require("./register-environments-commands");
const register_storage_commands_1 = require("./register-storage-commands");
function registerCommands(deps) {
    (0, register_autocomplete_commands_1.registerCommands)(deps);
    (0, register_authentication_command_1.registerCommands)(deps);
    (0, register_app_commands_1.registerCommands)(deps);
    (0, register_deployment_commands_1.registerCommands)(deps);
    (0, register_installation_commands_1.registerCommands)(deps);
    (0, register_environments_commands_1.registerCommands)(deps);
    (0, register_environment_variables_commands_1.registerCommands)(deps);
    (0, register_lint_command_1.registerCommands)(deps);
    (0, register_log_commands_1.registerCommands)(deps);
    (0, register_tunnel_commands_1.registerCommands)(deps);
    (0, register_webtrigger_commands_1.registerCommands)(deps);
    (0, register_feedback_commands_1.registerCommands)(deps);
    (0, register_settings_commands_1.registerCommands)(deps);
    (0, register_providers_commands_1.registerCommands)(deps);
    (0, register_storage_commands_1.registerCommands)(deps);
}
exports.registerCommands = registerCommands;
const registerEvents = ({ ui }) => {
    process.on('unhandledRejection', async (reason, promise) => {
        await (0, cli_shared_1.exitOnError)(ui, new Error(cli_shared_1.Text.error.unhandledRejection(reason, promise)));
    });
};
const main = async () => {
    const cliDetails = (0, version_info_1.getCLIDetails)();
    const deps = await (0, dependency_injection_1.getDependencies)(cliDetails);
    registerEvents(deps);
    registerCommands(deps);
    await deps.controllers.prerequisitesController.check();
    await deps.cmd.parse(process.argv);
};
exports.main = main;
