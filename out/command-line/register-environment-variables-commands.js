"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.listEnvironmentVariableCommandHandler = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const COMMAND_NAME = 'variables';
const SET_COMMAND_NAME = 'set';
const registerSetEnvironmentVariableCommand = ({ cmd, ui, commands: { setEnvironmentVariableCommand } }) => {
    cmd
        .command(`${SET_COMMAND_NAME} [key] [value]`)
        .requireAppId()
        .description(cli_shared_1.Text.varsSet.cmd.desc)
        .option('--encrypt', cli_shared_1.Text.varsSet.optionSecret, false)
        .environmentOption()
        .action(async (key, value, { environment, encrypt }) => {
        ui.info(cli_shared_1.Text.varsSet.overview(environment, (0, cli_shared_1.guessEnvironmentType)(environment)));
        ui.info(cli_shared_1.Text.ctrlC);
        ui.emptyLine();
        if (!value && !encrypt) {
            ui.info(cli_shared_1.Text.varsSet.encryptInfo);
            ui.emptyLine();
            encrypt =
                (await ui.promptForList(cli_shared_1.Text.varsSet.promptEncrypt, [cli_shared_1.Text.varsSet.yes, cli_shared_1.Text.varsSet.no])) ===
                    cli_shared_1.Text.varsSet.yes;
            ui.emptyLine();
        }
        if (!key) {
            ui.info(cli_shared_1.Text.varsSet.keyInfo);
            ui.emptyLine();
            key = await ui.promptForText(cli_shared_1.Text.varsSet.promptKey);
        }
        if (!value) {
            value = encrypt
                ? await ui.promptForSecret(cli_shared_1.Text.varsSet.promptValue)
                : await ui.promptForText(cli_shared_1.Text.varsSet.promptValue);
            ui.emptyLine();
        }
        await ui.displayProgress(() => setEnvironmentVariableCommand.execute({ environment, encrypt, key, value }), cli_shared_1.Text.varsSet.cmd.start, cli_shared_1.Text.varsSet.cmd.success);
        ui.info(cli_shared_1.Text.varsList.hint);
    });
};
const UNSET_COMMAND_NAME = 'unset';
const registerDeleteEnvironmentVariableCommand = ({ cmd, ui, commands: { deleteEnvironmentVariableCommand } }) => {
    cmd
        .command(`${UNSET_COMMAND_NAME} <key>`)
        .requireAppId()
        .description(cli_shared_1.Text.varsUnset.cmd.desc)
        .environmentOption()
        .action(async (key, { environment }) => {
        ui.info(cli_shared_1.Text.varsUnset.cmd.start(environment, (0, cli_shared_1.guessEnvironmentType)(environment)));
        ui.info(cli_shared_1.Text.ctrlC);
        await deleteEnvironmentVariableCommand.execute({ environment, key });
        ui.info(cli_shared_1.Text.varsUnset.cmd.success(key));
        ui.info(cli_shared_1.Text.varsList.hint);
    });
};
const LIST_COMMAND_NAME = 'list';
async function listEnvironmentVariableCommandHandler(ui, listEnvironmentVariablesCommand, environment, json) {
    const variables = await listEnvironmentVariablesCommand.execute({ environment });
    ui.table([
        ['encrypted', 'Encrypted?'],
        ['key', 'Key'],
        ['value', 'Value']
    ], variables === null || variables === void 0 ? void 0 : variables.map(({ encrypt: encrypted, key, value }) => ({
        encrypted,
        key,
        value: encrypted ? cli_shared_1.Text.varsList.encryptedValue : value
    })), {
        json,
        emptyMessage: cli_shared_1.Text.varsList.empty(environment, (0, cli_shared_1.guessEnvironmentType)(environment)),
        preMessage: cli_shared_1.Text.varsList.overview(environment, (0, cli_shared_1.guessEnvironmentType)(environment)),
        postMessage: cli_shared_1.Text.varsList.postfix,
        format: {
            encrypted: (value) => (value ? '✔' : '')
        }
    });
}
exports.listEnvironmentVariableCommandHandler = listEnvironmentVariableCommandHandler;
const registerListEnvironmentVariableCommand = ({ cmd, ui, commands: { listEnvironmentVariablesCommand } }) => {
    cmd
        .command(LIST_COMMAND_NAME)
        .requireAppId()
        .description(cli_shared_1.Text.varsList.cmd)
        .environmentOption()
        .jsonOption()
        .action(async ({ environment, json }) => {
        await listEnvironmentVariableCommandHandler(ui, listEnvironmentVariablesCommand, environment, json);
    });
};
const DEPRECATED_SET_COMMAND = 'variables:set';
const DEPRECATED_UNSET_COMMAND = 'variables:unset';
const DEPRECATED_LIST_COMMAND = 'variables:list';
const registerVariablesSubcommandStubs = ({ cmd, controllers: { stubController } }) => {
    cmd.deprecatedCommand(DEPRECATED_SET_COMMAND, `${COMMAND_NAME} ${SET_COMMAND_NAME}`, stubController);
    cmd.deprecatedCommand(DEPRECATED_UNSET_COMMAND, `${COMMAND_NAME} ${UNSET_COMMAND_NAME}`, stubController);
    cmd.deprecatedCommand(DEPRECATED_LIST_COMMAND, `${COMMAND_NAME} ${LIST_COMMAND_NAME}`, stubController);
};
const registerCommands = (_a) => {
    var { cmd } = _a, deps = tslib_1.__rest(_a, ["cmd"]);
    const variables = cmd.command(COMMAND_NAME).description(cli_shared_1.Text.variables.description);
    registerVariablesSubcommandStubs(Object.assign({ cmd }, deps));
    registerSetEnvironmentVariableCommand(Object.assign({ cmd: variables }, deps));
    registerDeleteEnvironmentVariableCommand(Object.assign({ cmd: variables }, deps));
    registerListEnvironmentVariableCommand(Object.assign({ cmd: variables }, deps));
};
exports.registerCommands = registerCommands;
