"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSingleInstallation = exports.validateInstallationId = void 0;
const cli_shared_1 = require("@forge/cli-shared");
function validateInstallationId(installationId) {
    if (!installationId) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.installationId.errors.invalid);
    }
    const trimmedId = installationId.trim();
    if (trimmedId.length === 0) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.installationId.errors.invalid);
    }
    return trimmedId;
}
exports.validateInstallationId = validateInstallationId;
async function selectSingleInstallation(ui, installations, installationTablePrompt, installationTableOverview) {
    const installationIndex = await ui.promptForSingleChoiceTable(installationTablePrompt, installationTableOverview, ['Environment', 'Site', 'Product', 'Version'], installations.map(({ id, environmentKey, product, site, version }) => ({
        names: [
            (0, cli_shared_1.environmentToOption)(environmentKey),
            site,
            (0, cli_shared_1.capitalise)(product),
            cli_shared_1.Text.install.booleanToScope(version.isLatest)
        ],
        value: id,
        primary: site
    })));
    return installations[installationIndex];
}
exports.selectSingleInstallation = selectSingleInstallation;
