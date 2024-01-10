"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.performMultipleUninstalls = exports.performSingleUninstall = exports.validateContext = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const shared_1 = require("../installations/shared");
const errors_1 = require("./errors");
const COMMAND_NAME = 'install';
async function validateContext({ site, product }) {
    if (product) {
        product = (0, cli_shared_1.productDisplayName)(product);
        if (!(0, cli_shared_1.isSupportedProduct)(product)) {
            throw new cli_shared_1.ValidationError(cli_shared_1.Text.error.invalidProduct);
        }
    }
    const siteURL = site ? (0, cli_shared_1.validateSite)(site, product) : undefined;
    return { siteURL, product };
}
exports.validateContext = validateContext;
const registerInstallAppCommand = ({ cmd, controllers: { installController } }) => {
    cmd
        .requireAppId()
        .environmentOption()
        .option('-s, --site [site]', cli_shared_1.Text.optionSite)
        .option('-p, --product [product]', cli_shared_1.Text.optionProduct((0, cli_shared_1.getSupportedProducts)()))
        .precondition(validateContext)
        .option('--upgrade', cli_shared_1.Text.install.optionUpgrade, false)
        .option('--confirm-scopes', cli_shared_1.Text.install.optionConfirmScopes, false)
        .nonInteractiveOption('--site', '--product', '--environment')
        .description(cli_shared_1.Text.install.cmd.description)
        .action(async ({ environment, siteURL, product, upgrade, confirmScopes, nonInteractive }) => {
        await installController.run({ environment, site: siteURL, product, upgrade, confirmScopes, nonInteractive });
    });
};
const LIST_COMMAND_NAME = 'list';
const registerListInstallationsCommand = ({ cmd, ui, services: { installationsService } }) => {
    cmd
        .command(LIST_COMMAND_NAME)
        .requireAppId()
        .jsonOption()
        .description(cli_shared_1.Text.installList.cmd)
        .action(async ({ json }) => {
        const { installations } = await installationsService.listAppInstallations();
        ui.table([
            ['id', 'Installation ID'],
            ['environment', 'Environment'],
            ['site', 'Site'],
            ['product', 'Product'],
            ['version', 'Version']
        ], installations.map(({ id, environmentKey, product, site, version: { isLatest } }) => ({
            id,
            environment: (0, cli_shared_1.environmentToOption)(environmentKey),
            site,
            product: (0, cli_shared_1.productDisplayName)(product),
            version: cli_shared_1.Text.install.booleanToScope(isLatest)
        })), {
            json,
            emptyMessage: cli_shared_1.Text.installList.noInstallations,
            preMessage: cli_shared_1.Text.installList.banner
        });
    });
};
const performSingleUninstall = async (installId, { ui, commands: { uninstallAppCommand } }) => {
    const installation = await ui.displayProgress(() => uninstallAppCommand.execute(installId), cli_shared_1.Text.uninstall.cmd.start, (result) => ({
        successful: !!result.successful,
        message: cli_shared_1.Text.uninstall.cmd.success(false)
    }));
    const uninstallMessageFormat = installation.successful ? cli_shared_1.Text.uninstall.done : cli_shared_1.Text.uninstall.failed;
    const uninstallMessage = uninstallMessageFormat((0, cli_shared_1.productDisplayName)(installation.product), installation.site, installation.environmentKey, false);
    if (installation.successful) {
        ui.info(uninstallMessage);
    }
    else {
        ui.error(new shared_1.UninstallAppError(uninstallMessage));
    }
};
exports.performSingleUninstall = performSingleUninstall;
const performMultipleUninstalls = async (appsToUninstall, { ui, commands: { uninstallAppCommand } }) => {
    const filteredInstallations = appsToUninstall.filter(({ product }) => product !== 'identity');
    const hasMultipleNonIdentityApps = filteredInstallations.length > 1;
    const uninstalledApps = await ui.displayProgress(() => uninstallAppCommand.batchExecute([], appsToUninstall), cli_shared_1.Text.uninstall.cmd.start, (result) => {
        const isSuccessful = !result.some(({ successful }) => successful === false);
        return {
            successful: isSuccessful,
            message: cli_shared_1.Text.uninstall.cmd.success(hasMultipleNonIdentityApps)
        };
    });
    const deferredErrors = [];
    uninstalledApps.forEach((uninstall) => {
        const uninstallMessageFormat = uninstall.successful ? cli_shared_1.Text.uninstall.done : cli_shared_1.Text.uninstall.failed;
        const formattedMessage = uninstallMessageFormat((0, cli_shared_1.productDisplayName)(uninstall.product), uninstall.site, uninstall.environmentKey, hasMultipleNonIdentityApps);
        if (uninstall.successful && uninstall.product !== 'identity') {
            ui.info(formattedMessage);
        }
        else if (!uninstall.successful) {
            const uninstallError = new shared_1.UninstallAppError(formattedMessage);
            ui.error(uninstallError);
            deferredErrors.push(uninstallError);
        }
    });
    if (uninstalledApps.some(({ successful }) => successful === false)) {
        throw new errors_1.DeferredErrors(deferredErrors);
    }
    if (hasMultipleNonIdentityApps) {
        ui.info(cli_shared_1.Text.uninstall.interactive.done);
    }
};
exports.performMultipleUninstalls = performMultipleUninstalls;
const registerUninstallCommand = (deps) => {
    const { cmd, ui, services: { installationsService } } = deps;
    cmd
        .command('uninstall [installationId]')
        .requireAppId()
        .description(cli_shared_1.Text.uninstall.cmd.desc)
        .action(async (installationId) => {
        const { installations } = await installationsService.listAppInstallations();
        if (!installations.length) {
            ui.info(cli_shared_1.Text.installList.noInstallations);
            return;
        }
        const installId = installationId === null || installationId === void 0 ? void 0 : installationId.trim();
        if (installId && installId.length > 0) {
            ui.info(cli_shared_1.Text.uninstall.info);
            ui.info(cli_shared_1.Text.ctrlC);
            ui.emptyLine();
            await (0, exports.performSingleUninstall)(installId, deps);
        }
        else {
            const filteredInstallations = installations.filter((install) => install.product !== 'identity' && install.product !== 'jira-servicedesk');
            const selectedSitesIndexes = await ui.promptForTable(cli_shared_1.Text.uninstall.interactive.desc, cli_shared_1.Text.uninstall.interactive.progressInfo, ['Environment', 'Site', 'Product'], filteredInstallations.map(({ id, environmentKey, product, site }) => ({
                names: [(0, cli_shared_1.environmentToOption)(environmentKey), site, (0, cli_shared_1.productDisplayName)(product)],
                value: id
            })));
            const appsToUninstall = filteredInstallations.filter((_, index) => selectedSitesIndexes.includes(index));
            const selectedSites = new Set(appsToUninstall.map(({ site }) => site));
            const remainingApps = filteredInstallations.filter((_, index) => !selectedSitesIndexes.includes(index));
            appsToUninstall.push(...(0, shared_1.getHangingIdentityInstallationsFromSite)(installations, remainingApps, selectedSites));
            if (appsToUninstall.length > 1) {
                await (0, exports.performMultipleUninstalls)(appsToUninstall, deps);
            }
            else {
                await (0, exports.performSingleUninstall)(appsToUninstall[0].id, deps);
            }
        }
    });
};
const DEPRECATED_LIST_COMMAND = 'install:list';
const registerCommands = (_a) => {
    var { cmd } = _a, deps = tslib_1.__rest(_a, ["cmd"]);
    const install = cmd.command(COMMAND_NAME).description(cli_shared_1.Text.variables.description);
    registerUninstallCommand(Object.assign({ cmd }, deps));
    cmd.deprecatedCommand(DEPRECATED_LIST_COMMAND, `${COMMAND_NAME} ${LIST_COMMAND_NAME}`, deps.controllers.stubController);
    registerInstallAppCommand(Object.assign({ cmd: install }, deps));
    registerListInstallationsCommand(Object.assign({ cmd: install }, deps));
};
exports.registerCommands = registerCommands;
