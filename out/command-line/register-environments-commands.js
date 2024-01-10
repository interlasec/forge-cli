"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.deleteEnvironmentHandler = exports.listEnvironmentHandler = exports.createEnvironmentHandler = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const errors_1 = require("./errors");
const COMMAND_NAME = 'environments';
const createEnvironmentHandler = async (ui, createEnvironmentCommand, environmentKey) => {
    if (!environmentKey) {
        ui.info(cli_shared_1.Text.createEnvironment.overview);
        ui.emptyLine();
        environmentKey = await ui.promptForText(cli_shared_1.Text.createEnvironment.promptEnvironmentKey);
        ui.emptyLine();
    }
    const args = {
        environmentKey: (0, cli_shared_1.optionToEnvironment)(environmentKey)
    };
    await ui.displayProgress(() => createEnvironmentCommand.execute(args), cli_shared_1.Text.createEnvironment.cmd.start, cli_shared_1.Text.createEnvironment.cmd.success(environmentKey, cli_shared_1.AppEnvironmentType.Development));
    ui.emptyLine();
    ui.info(cli_shared_1.Text.createEnvironment.successMessage);
};
exports.createEnvironmentHandler = createEnvironmentHandler;
const listEnvironmentHandler = async (ui, listEnvironmentCommand) => {
    const envOrder = {
        PRODUCTION: 1,
        STAGING: 2,
        DEVELOPMENT: 3
    };
    const environments = (await listEnvironmentCommand.execute()).sort((a, b) => a.type === b.type ? Number(a.lastDeployedAt) - Number(b.lastDeployedAt) : envOrder[a.type] - envOrder[b.type]);
    ui.table([
        ['type', 'Type'],
        ['name', 'Name'],
        ['lastDeployedAt', 'Last deployed at']
    ], environments.map(({ type, key, lastDeployedAt }) => {
        return {
            type,
            name: (0, cli_shared_1.environmentToOption)(key),
            lastDeployedAt
        };
    }), {
        preMessage: cli_shared_1.Text.listEnvironment.overview,
        format: {
            lastDeployedAt: (value) => new Date(Number(value)).toISOString()
        },
        groupRows: {
            type: true
        }
    });
};
exports.listEnvironmentHandler = listEnvironmentHandler;
const deleteEnvironmentHandler = async (ui, options, listEnvironmentCommand, deleteEnvironmentCommand) => {
    let confirmDeleteEnvironments = false;
    let environmentKeys = options.environment;
    const nonInteractive = options.nonInteractive;
    if (!environmentKeys) {
        environmentKeys = await getEnvironmentKeysToDelete(ui, listEnvironmentCommand);
    }
    if (!environmentKeys) {
        return;
    }
    environmentKeys = environmentKeys.map(cli_shared_1.optionToEnvironment);
    if (nonInteractive) {
        confirmDeleteEnvironments = true;
    }
    if (!confirmDeleteEnvironments) {
        confirmDeleteEnvironments = await getDeleteConfirmation(ui, environmentKeys);
    }
    if (!confirmDeleteEnvironments) {
        return;
    }
    ui.emptyLine();
    const { deletedEnvironments, successful } = await deleteEnvironments(ui, deleteEnvironmentCommand, environmentKeys);
    ui.emptyLine();
    displayDeleteResult(ui, deletedEnvironments, successful);
};
exports.deleteEnvironmentHandler = deleteEnvironmentHandler;
const getEnvironmentKeysToDelete = async (ui, listEnvironmentCommand) => {
    const environments = (await listEnvironmentCommand.execute())
        .filter((env) => env.type === cli_shared_1.AppEnvironmentType.Development && env.key !== cli_shared_1.DEFAULT_ENVIRONMENT_KEY)
        .sort((a, b) => Number(a.lastDeployedAt) - Number(b.lastDeployedAt));
    if (environments.length === 0) {
        ui.info(cli_shared_1.Text.deleteEnvironment.noEnvironmentMessage);
        return;
    }
    ui.info(cli_shared_1.Text.deleteEnvironment.overview);
    ui.emptyLine();
    const selectedEnvironmentIndexes = await ui.promptForTable(cli_shared_1.Text.deleteEnvironment.prompt, cli_shared_1.Text.deleteEnvironment.info, ['Name', 'Last deployed at'], environments.map(({ key, lastDeployedAt }) => ({
        names: [(0, cli_shared_1.environmentToOption)(key), new Date(Number(lastDeployedAt)).toISOString()]
    })));
    return selectedEnvironmentIndexes.map((index) => environments[index].key);
};
const getDeleteConfirmation = async (ui, environmentKeys) => {
    ui.info(cli_shared_1.Text.deleteEnvironment.confirmationInfo);
    ui.emptyLine();
    environmentKeys.forEach((envKey) => {
        ui.info(chalk_1.default.grey((0, cli_shared_1.environmentToOption)(envKey)));
    });
    ui.emptyLine();
    ui.warn(cli_shared_1.Text.deleteEnvironment.warningMessage);
    ui.emptyLine();
    return ui.confirm(cli_shared_1.Text.deleteEnvironment.promptConfirmation);
};
const deleteEnvironments = async (ui, deleteEnvironmentCommand, environmentKeys) => {
    let successful = false;
    const args = { environmentKeys };
    const deletedEnvironments = await ui.displayProgress(() => deleteEnvironmentCommand.batchExecute(args), cli_shared_1.Text.deleteEnvironment.cmd.start, (result) => {
        successful = result.every(({ successful }) => successful);
        return {
            successful,
            message: cli_shared_1.Text.deleteEnvironment.cmd.start
        };
    });
    return {
        deletedEnvironments,
        successful
    };
};
const displayDeleteResult = (ui, deletedEnvironments, deleteSuccessful) => {
    const deferredErrors = [];
    const successfulDelete = deletedEnvironments.filter((env) => env.successful);
    const failedDelete = deletedEnvironments.filter((env) => !env.successful);
    successfulDelete.forEach(({ environmentKey }) => {
        ui.info(cli_shared_1.Text.deleteEnvironment.individualSuccessMessage(environmentKey, cli_shared_1.AppEnvironmentType.Development));
    });
    failedDelete.forEach(({ error }) => {
        if (error !== undefined) {
            ui.error(error);
            deferredErrors.push(error);
        }
    });
    if (!deleteSuccessful) {
        throw new errors_1.DeferredErrors(deferredErrors);
    }
    ui.emptyLine();
    ui.info(cli_shared_1.Text.deleteEnvironment.successMessage);
};
const registerCreateEnvironmentsCommand = (parent, { ui, commands: { createEnvironmentCommand } }) => {
    parent
        .command('create')
        .requireAppId()
        .description(cli_shared_1.Text.createEnvironment.cmd.desc)
        .option('-e, --environment [environment]', cli_shared_1.Text.createEnvironment.optionEnvironmentKey)
        .nonInteractiveOption('--environment')
        .action(async ({ environment }) => {
        await (0, exports.createEnvironmentHandler)(ui, createEnvironmentCommand, environment);
    });
};
const registerListEnvironmentsCommand = (parent, { ui, commands: { listEnvironmentCommand } }) => {
    parent
        .command('list')
        .requireAppId()
        .description(cli_shared_1.Text.listEnvironment.cmd.desc)
        .action(async () => {
        await (0, exports.listEnvironmentHandler)(ui, listEnvironmentCommand);
    });
};
const registerDeleteEnvironmentsCommand = (parent, { ui, commands: { listEnvironmentCommand, deleteEnvironmentCommand } }) => {
    parent
        .command('delete')
        .requireAppId()
        .description(cli_shared_1.Text.deleteEnvironment.cmd.desc)
        .option('-e, --environment [environments...]', cli_shared_1.Text.deleteEnvironment.optionEnvironmentKey)
        .nonInteractiveOption('--environment')
        .action(async (options) => {
        await (0, exports.deleteEnvironmentHandler)(ui, options, listEnvironmentCommand, deleteEnvironmentCommand);
    });
};
const registerCommands = (deps) => {
    const { cmd } = deps;
    const environment = cmd.command(COMMAND_NAME).description(cli_shared_1.Text.environment.desc);
    registerCreateEnvironmentsCommand(environment, deps);
    registerListEnvironmentsCommand(environment, deps);
    registerDeleteEnvironmentsCommand(environment, deps);
};
exports.registerCommands = registerCommands;
