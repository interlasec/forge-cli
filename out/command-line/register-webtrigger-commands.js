"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const cli_shared_2 = require("@forge/cli-shared");
const installation_helper_1 = require("../installations/installation-helper");
const getAvailableWebTriggers = (appConfig) => {
    const output = new Map();
    if (appConfig.modules && appConfig.modules.webtrigger) {
        for (const webtrigger of appConfig.modules.webtrigger) {
            output.set(webtrigger.key, webtrigger.function);
        }
    }
    return output;
};
async function getValidWebtriggers(configFile) {
    const manifest = await configFile.readConfig();
    const availableWebTriggers = getAvailableWebTriggers(manifest);
    if (!availableWebTriggers.size) {
        throw new cli_shared_2.ValidationError(cli_shared_1.Text.webtrigger.error.noWebtriggers);
    }
    return availableWebTriggers;
}
function manifestDefinesTriggers(configFile) {
    return async () => {
        await getValidWebtriggers(configFile);
    };
}
const registerCommands = ({ cmd, ui, graphqlGateway, configFile, services: { installationsService }, commands: { getWebTriggerURLCommand } }) => {
    const validateWebtriggerKey = async (functionKey) => {
        const availableWebTriggers = await getValidWebtriggers(configFile);
        if (functionKey) {
            if (!availableWebTriggers.has(functionKey)) {
                throw new cli_shared_2.ValidationError(cli_shared_1.Text.webtrigger.error.funcKey);
            }
            return functionKey;
        }
        else {
            const options = [...availableWebTriggers.keys()];
            return await ui.promptForList(cli_shared_1.Text.webtrigger.promptFuncKey, options);
        }
    };
    cmd
        .command('webtrigger [installationId]')
        .requireAppId()
        .description(cli_shared_1.Text.webtrigger.cmd)
        .option('-f, --functionKey [function]', cli_shared_1.Text.webtrigger.optionFuncKey)
        .precondition(manifestDefinesTriggers(configFile))
        .action(async (argInstallationId, { functionKey }) => {
        let selectedInstallationId = '';
        if (argInstallationId) {
            ui.info(cli_shared_1.Text.webtrigger.overviewFuncKey);
            selectedInstallationId = (0, installation_helper_1.validateInstallationId)(argInstallationId);
        }
        else {
            const appInstallation = await installationsService.listNonTechnicalAppInstallations();
            const installation = await (0, installation_helper_1.selectSingleInstallation)(ui, appInstallation.installations, cli_shared_1.Text.webtrigger.promptInstallationTable, cli_shared_1.Text.webtrigger.overViewInstallationTable);
            selectedInstallationId = (0, installation_helper_1.validateInstallationId)(installation.id);
        }
        const url = await getWebTriggerURLCommand.execute(selectedInstallationId, await validateWebtriggerKey(functionKey));
        ui.info(cli_shared_1.Text.webtrigger.copy(url));
    });
};
exports.registerCommands = registerCommands;
