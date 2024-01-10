"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const registerConfigureProviderCommand = ({ cmd, ui, commands: { configureProviderCommand }, configFile }) => {
    cmd
        .command('providers')
        .description(cli_shared_1.Text.providers.desc)
        .command('configure [providerKey]')
        .requireAppId()
        .description(cli_shared_1.Text.configureProvider.cmd.desc)
        .option('-s, --oauth-client-secret [oauthClientSecret]', cli_shared_1.Text.configureProvider.optionClientSecret)
        .environmentOption()
        .action(async (providerKey, { environment, oauthClientSecret }) => {
        ui.info(cli_shared_1.Text.configureProvider.overview(environment));
        ui.info(cli_shared_1.Text.ctrlC);
        ui.emptyLine();
        const availableProviders = await configFile.getAuthProviders();
        if (!providerKey || !availableProviders[providerKey]) {
            const providersList = Object.values(availableProviders);
            if (providersList.length === 0) {
                ui.info(cli_shared_1.Text.configureProvider.noProviders);
                ui.emptyLine();
                return;
            }
            const providerIndex = await ui.promptForSingleChoiceTable(cli_shared_1.Text.configureProvider.promptProviderKey, cli_shared_1.Text.configureProvider.providerKeyInfo, ['Provider Key', 'Provider Name'], providersList.map(({ key, name }) => ({
                names: [key, name],
                value: key,
                primary: name
            })));
            providerKey = providersList[providerIndex].key;
        }
        if (!oauthClientSecret) {
            oauthClientSecret = await ui.promptForSecret(cli_shared_1.Text.configureProvider.promptClientSecret);
            ui.emptyLine();
        }
        const args = { environment, providerKey, clientSecret: oauthClientSecret };
        await ui.displayProgress(() => configureProviderCommand.execute(args), cli_shared_1.Text.configureProvider.cmd.start, cli_shared_1.Text.configureProvider.cmd.success);
    });
};
const registerCommands = (deps) => {
    registerConfigureProviderCommand(deps);
};
exports.registerCommands = registerCommands;
