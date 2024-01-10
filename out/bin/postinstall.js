"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_client_1 = require("../analytics-client/analytics-client");
const cli_shared_1 = require("@forge/cli-shared");
const local_file_storage_1 = require("../storage/local-file-storage");
const workers_starter_1 = require("../workers/workers-starter");
const version_info_1 = require("../command-line/version-info");
const anon_user_id_1 = require("../command-line/anon-user-id");
const isSupportedShell_1 = require("../autocomplete/isSupportedShell");
const cached_config_service_1 = require("../service/cached-config-service");
const ui = new cli_shared_1.CommandLineUI(() => true);
const cachedConf = cli_shared_1.CachedConf.getCache(cli_shared_1.CONFIG_PROJECT_NAME);
const configService = new cached_config_service_1.CachedConfigService(cachedConf);
const analyticsClientReporter = new analytics_client_1.AnalyticsClientReporter(new local_file_storage_1.LocalFileStorage(), ui, configService);
const cliDetails = (0, version_info_1.getCLIDetails)();
const attributes = { version: cliDetails === null || cliDetails === void 0 ? void 0 : cliDetails.version };
const anonId = (0, anon_user_id_1.getAnonId)(true);
analyticsClientReporter.reportSuccess('postinstall', anonId, attributes);
if ((0, isSupportedShell_1.isSupportedShell)()) {
    ui.info(cli_shared_1.Text.autocomplete.postinstall);
}
new workers_starter_1.WorkersStarter(undefined);
