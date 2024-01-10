"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const registerCommands = ({ cmd, controllers: { lintController } }) => {
    cmd
        .command('lint')
        .requireAppId()
        .description(cli_shared_1.Text.lint.cmd)
        .option('--fix', 'attempt to automatically fix any issues encountered', false)
        .environmentOption()
        .action(async ({ environment, fix }) => {
        await lintController.run(environment, fix);
    });
};
exports.registerCommands = registerCommands;
