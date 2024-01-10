"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const registerCommands = ({ cmd, ui, controllers: { tunnelController } }) => {
    cmd
        .command('tunnel')
        .requireAppId()
        .description(cli_shared_1.Text.tunnel.cmd)
        .environmentOption()
        .option('-d, --debug', cli_shared_1.Text.tunnel.optionDebugger)
        .action(async (options) => {
        await tunnelController.run(options, ui);
    });
};
exports.registerCommands = registerCommands;
