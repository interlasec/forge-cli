"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const registerCommands = ({ cmd, controllers: { autocompleteController } }) => {
    cmd
        .command('autocomplete [install|uninstall]')
        .requireNoAuthentication()
        .description(cli_shared_1.Text.autocomplete.cmd.desc)
        .action(async (arg) => {
        await autocompleteController.run(arg);
    });
};
exports.registerCommands = registerCommands;
