"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.listIndexes = exports.getManifestEntities = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const COMMAND_NAME = 'storage';
async function getManifestEntities(configFile) {
    var _a, _b;
    const manifest = await configFile.readConfig();
    return { entities: ((_b = (_a = manifest.app.storage) === null || _a === void 0 ? void 0 : _a.entities) === null || _b === void 0 ? void 0 : _b.map((entity) => entity.name)) || [] };
}
exports.getManifestEntities = getManifestEntities;
async function listIndexes(data, configFile, { ui, commands: { listEntitiesIndexesCommand } }) {
    const { entities } = await getManifestEntities(configFile);
    if (!entities.length) {
        throw new Error(cli_shared_1.Text.entitiesIndexesList.missingEntities);
    }
    const result = await listEntitiesIndexesCommand.execute((0, cli_shared_1.optionToEnvironment)(data.environment || 'development'));
    ui.table([
        ['entityName', 'Entity name'],
        ['indexName', 'Index name'],
        ['indexStatus', 'Index status'],
        ['partition', 'Partition'],
        ['range', 'Range']
    ], result.indexes);
}
exports.listIndexes = listIndexes;
const registerListCustomEntityIndexCommand = (parent, configFile, deps) => {
    parent
        .command('list')
        .requireAppId()
        .environmentOption()
        .description(cli_shared_1.Text.entitiesIndexesList.cmd.desc)
        .action(async (data) => {
        await listIndexes(data, configFile, deps);
    });
};
const registerCustomEntitiesIndexesCommand = (parent, { ui }) => {
    return parent.command('indexes').requireAppId().description(cli_shared_1.Text.entitiesIndexes.cmd.desc);
};
const registerCustomEntitiesCommand = (parent, { ui }) => {
    return parent.command('entities').requireAppId().description(cli_shared_1.Text.entitiesIndexes.cmd.desc);
};
const registerCommands = (deps) => {
    const { cmd, configFile } = deps;
    const storage = cmd.command(COMMAND_NAME).description(cli_shared_1.Text.storage.cmd.desc);
    const customEntitiesCommand = registerCustomEntitiesCommand(storage, deps);
    const customEntitiesIndexesCommand = registerCustomEntitiesIndexesCommand(customEntitiesCommand, deps);
    registerListCustomEntityIndexCommand(customEntitiesIndexesCommand, configFile, deps);
};
exports.registerCommands = registerCommands;
