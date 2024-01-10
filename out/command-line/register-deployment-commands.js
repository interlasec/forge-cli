"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const DEPLOY_COMMAND_NAME = 'deploy';
const registerCommands = ({ cmd, controllers: { deployController } }) => {
    cmd
        .command(DEPLOY_COMMAND_NAME)
        .requireAppId()
        .description(cli_shared_1.Text.deploy.cmd.desc)
        .option('-f, --no-verify', 'disable pre-deployment checks')
        .environmentOption()
        .nonInteractiveOption()
        .action(async (opts) => deployController.run(opts));
};
exports.registerCommands = registerCommands;
