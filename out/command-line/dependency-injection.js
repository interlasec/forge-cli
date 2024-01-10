"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependencies = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const bundler_1 = require("@forge/bundler");
const cli_shared_1 = require("@forge/cli-shared");
const tunnel_1 = require("@forge/tunnel");
const runtime_1 = require("@forge/runtime");
const node_runtime_1 = require("@forge/node-runtime");
const analytics_client_1 = require("../analytics-client/analytics-client");
const deploy_1 = require("../deploy");
const delete_environment_variable_1 = require("../environment-variables/delete-environment-variable");
const graphql_client_1 = require("../environment-variables/graphql-client");
const list_environment_variables_1 = require("../environment-variables/list-environment-variables");
const set_environment_variable_1 = require("../environment-variables/set-environment-variable");
const graphql_client_2 = require("../migration-keys/graphql-client");
const configure_provider_1 = require("../providers/configure-provider");
const graphql_client_3 = require("../providers/graphql-client");
const list_indexes_1 = require("../entities/list-indexes");
const graphql_client_4 = require("../entities/graphql-client");
const create_environment_1 = require("../environment/create-environment");
const list_environment_1 = require("../environment/list-environment");
const delete_environment_1 = require("../environment/delete-environment");
const graphql_client_5 = require("../environment/graphql-client");
const graphql_client_6 = require("../installations/graphql-client");
const site_translation_1 = require("../installations/site-translation");
const install_app_site_1 = require("../installations/install-app-site");
const uninstall_app_1 = require("../installations/uninstall-app");
const cached_config_service_1 = require("../service/cached-config-service");
const docker_service_1 = require("../service/docker-service");
const installation_service_1 = require("../service/installation-service");
const lint_service_1 = require("../service/lint-service");
const lite_lint_service_1 = require("../service/lite-lint-service");
const port_finding_service_1 = require("../service/port-finding-service");
const resource_packaging_service_1 = require("../service/resource-packaging-service");
const resources_uploader_service_1 = require("../service/resources-uploader-service");
const tunnel_analytics_service_1 = require("../service/tunnel-analytics-service");
const tunnel_service_1 = require("../service/tunnel-service");
const migration_keys_service_1 = require("../service/migration-keys-service");
const custom_entities_service_1 = require("../service/custom-entities-service");
const local_file_storage_1 = require("../storage/local-file-storage");
const get_webtrigger_url_1 = require("../webtrigger/get-webtrigger-url");
const worker_info_1 = require("../workers/worker-info");
const workers_starter_1 = require("../workers/workers-starter");
const command_1 = require("./command");
const autocomplete_controller_1 = require("./controller/autocomplete-controller");
const deploy_controller_1 = require("./controller/deploy-controller");
const feedback_controller_1 = require("./controller/feedback-controller");
const install_controller_1 = require("./controller/install-controller");
const lint_controller_1 = require("./controller/lint-controller");
const pre_command_controller_1 = require("./controller/pre-command-controller");
const settings_controller_1 = require("./controller/settings-controller");
const tunnel_controller_1 = require("./controller/tunnel-controller");
const analytics_settings_view_1 = require("./view/analytics-settings-view");
const deploy_view_1 = require("./view/deploy-view");
const install_view_1 = require("./view/install-view");
const lint_view_1 = require("./view/lint-view");
const lite_lint_view_1 = require("./view/lite-lint-view");
const settings_view_1 = require("./view/settings-view");
const tunnel_view_1 = require("./view/tunnel-view");
const graphql_client_7 = require("../webtrigger/graphql-client");
const stubController_1 = require("./controller/stubController");
const prerequisites_controller_1 = require("./controller/prerequisites-controller");
const runtime_bundler_1 = require("../deploy/packager/runtime-bundler");
const nativeui_bundler_1 = require("../deploy/packager/nativeui-bundler");
const sentry_1 = require("./sentry");
const default_environment_controller_1 = require("./controller/default-environment-controller");
const getDependencies = async (cliDetails) => {
    let cmd;
    const ui = new cli_shared_1.CommandLineUI(() => cmd.verbose);
    const cachedConf = cli_shared_1.CachedConf.getCache(cli_shared_1.CONFIG_PROJECT_NAME);
    const cachedConfigService = new cached_config_service_1.CachedConfigService(cachedConf);
    const analyticsClientReporter = new analytics_client_1.AnalyticsClientReporter(new local_file_storage_1.LocalFileStorage(), ui, cachedConfigService);
    const workerInfo = (0, worker_info_1.getWorkerInfo)(cliDetails);
    const workersStarter = new workers_starter_1.WorkersStarter(workerInfo);
    const fileReader = new cli_shared_1.FileSystemReader();
    const fileWriter = new cli_shared_1.FileSystemWriter();
    const configFile = new cli_shared_1.ConfigFile(fileReader, fileWriter);
    const appConfigReader = (0, cli_shared_1.configFileReaderForSection)(cli_shared_1.appConfigKey, cli_shared_1.appConfigShape, configFile);
    const assertiveAppConfigReader = (0, cli_shared_1.assertiveAppConfigProvider)(appConfigReader);
    const appConfigWriter = (0, cli_shared_1.configFileWriterForSection)(cli_shared_1.appConfigKey, cli_shared_1.appConfigShape, configFile);
    const credentialStore = (0, cli_shared_1.getCredentialStore)(ui);
    const featureFlagService = new cli_shared_1.FeatureFlagService(ui, cliDetails, credentialStore, appConfigReader);
    const settingsView = new settings_view_1.SettingsView(ui);
    const settingsController = new settings_controller_1.SettingsController(settingsView, cachedConfigService, assertiveAppConfigReader);
    const liteLintView = new lite_lint_view_1.LiteLintView(ui);
    const liteLintService = new lite_lint_service_1.LiteLintService();
    const analyticsSettingsView = new analytics_settings_view_1.AnalyticsSettingsView(ui);
    const preCommandController = new pre_command_controller_1.PreCommandController(liteLintService, liteLintView, configFile, cachedConfigService, analyticsSettingsView, settingsView);
    const graphqlGateway = (0, cli_shared_1.getGraphqlGateway)();
    const authenticator = new cli_shared_1.PersonalTokenAuthenticator(credentialStore);
    (0, sentry_1.initialiseSentry)({ cliDetails, cachedConfigService });
    const createGraphQLClient = (auth) => {
        const minimalGraphQLRunner = new cli_shared_1.MinimalGraphQLRunner(auth, graphqlGateway, cliDetails);
        const graphQLRunner = new cli_shared_1.DebuggingGraphqlRunner(minimalGraphQLRunner, graphqlGateway, ui);
        return new cli_shared_1.MutationAwareGraphQLClient(graphQLRunner);
    };
    const graphQLClient = createGraphQLClient(authenticator);
    const fileUploader = new cli_shared_1.HttpFileUploader(fileReader);
    const feedbackPostClient = new cli_shared_1.HttpsFeedbackPostClient();
    const zipAccessor = new cli_shared_1.AdmZipAccessor();
    const loginCommand = new cli_shared_1.LoginCommand(createGraphQLClient, credentialStore, ui);
    const logoutCommand = new cli_shared_1.LogoutCommand(credentialStore);
    const downloader = new cli_shared_1.TemplateServiceDownloader();
    const extractor = new cli_shared_1.ZipTemplateExtractor(zipAccessor);
    const lister = new cli_shared_1.TemplateServiceLister();
    const createAppGraphQLClient = new cli_shared_1.CreateAppGraphQLClient(graphQLClient);
    const registerAppCommand = new cli_shared_1.RegisterAppCommand(createAppGraphQLClient, appConfigReader, appConfigWriter, ui);
    const templater = new cli_shared_1.ComposableTemplater(downloader, extractor, lister, ui);
    const npmInstaller = new cli_shared_1.NpmInstaller(ui);
    const createAppCommand = new cli_shared_1.CreateAppCommand(templater, registerAppCommand, npmInstaller);
    const getAppOwnerQuery = new cli_shared_1.GetAppOwnerQuery(graphQLClient, assertiveAppConfigReader);
    const environmentVariablesClient = new graphql_client_1.GraphqlClient(graphQLClient);
    const setEnvironmentVariableCommand = new set_environment_variable_1.SetEnvironmentVariableCommand(environmentVariablesClient, assertiveAppConfigReader);
    const deleteEnvironmentVariableCommand = new delete_environment_variable_1.DeleteEnvironmentVariableCommand(environmentVariablesClient, assertiveAppConfigReader);
    const listEnvironmentVariablesCommand = new list_environment_variables_1.ListEnvironmentVariablesCommand(environmentVariablesClient, assertiveAppConfigReader);
    const providerClient = new graphql_client_3.GraphqlClient(graphQLClient);
    const configureProviderCommand = new configure_provider_1.ConfigureProviderCommand(providerClient, assertiveAppConfigReader);
    const environmentClient = new graphql_client_5.GraphqlClient(graphQLClient);
    const createEnvironmentCommand = new create_environment_1.CreateEnvironmentCommand(environmentClient, assertiveAppConfigReader);
    const listEnvironmentCommand = new list_environment_1.ListEnvironmentCommand(environmentClient, assertiveAppConfigReader);
    const deleteEnvironmentCommand = new delete_environment_1.DeleteEnvironmentCommand(environmentClient, assertiveAppConfigReader);
    const migrationKeysClient = new graphql_client_2.GraphqlClient(graphQLClient);
    const migrationKeysService = new migration_keys_service_1.MigrationKeysService(migrationKeysClient, assertiveAppConfigReader);
    const appEnvironmentClient = new cli_shared_1.AppEnvironmentsGraphqlClient(graphQLClient);
    const globalEdgeFetchClient = { fetch: node_fetch_1.default };
    const globalEdgeClient = new cli_shared_1.GlobalEdgeHttpClient(globalEdgeFetchClient);
    const logsClient = new cli_shared_1.LogsGraphQLClient(graphQLClient);
    const viewAppLogsCommand = new cli_shared_1.ViewAppLogsCommand(assertiveAppConfigReader, appEnvironmentClient, globalEdgeClient, logsClient);
    const appOauthClientGraphql = new cli_shared_1.AppOauthClientGraphqlClient(graphQLClient);
    const entitiesClient = new graphql_client_4.EntitiesGraphqlClient(graphQLClient);
    const customEntitiesService = new custom_entities_service_1.CustomEntitiesService(assertiveAppConfigReader, appOauthClientGraphql, entitiesClient);
    const listEntitiesIndexesCommand = new list_indexes_1.ListEntitiesIndexesCommand(customEntitiesService);
    const bitbucketTranslation = new site_translation_1.BitbucketTranslator();
    const cloudProductTranslation = new site_translation_1.CloudIdTranslator(graphQLClient);
    const installationsClient = new graphql_client_6.InstallationsGraphqlClient(graphQLClient, cloudProductTranslation, bitbucketTranslation, cli_shared_1.pause);
    const installAppSiteCommand = new install_app_site_1.InstallAppSiteCommand(assertiveAppConfigReader, installationsClient);
    const uninstallAppCommand = new uninstall_app_1.UninstallAppCommand(assertiveAppConfigReader, installationsClient);
    const deployMonitorClient = new deploy_1.DeployMonitorGraphqlClient(graphQLClient);
    const webTriggerGraphqlClient = new graphql_client_7.WebTriggerGraphQLClient(graphQLClient);
    const archiverFactory = () => (0, deploy_1.makeArchiver)(ui);
    const uploaderArtifactClient = new deploy_1.ArtifactGraphQLClient(graphQLClient);
    const triggerDeployClient = new deploy_1.TriggerDeployGraphQLClient(graphQLClient);
    const archiveUploader = new deploy_1.AppArchiveUploader(assertiveAppConfigReader, uploaderArtifactClient, fileUploader, ui, new resources_uploader_service_1.ResourcesUploaderService(fileReader));
    const deployer = new deploy_1.ArtifactDeployer(assertiveAppConfigReader, triggerDeployClient, deployMonitorClient, cli_shared_1.pause, ui);
    const sandboxBundle = (0, bundler_1.getSandboxBundler)();
    const nodeBundle = (0, bundler_1.getNodeBundler)((0, bundler_1.getWrapperProvider)({ fileSystemReader: fileReader }));
    const sandboxRuntimeBundler = new runtime_bundler_1.SandboxRuntimeBundler(archiverFactory, ui, sandboxBundle);
    const nodeRuntimeBundler = new runtime_bundler_1.NodeRuntimeBundler(archiverFactory, ui, nodeBundle);
    const nativeUiBundler = new nativeui_bundler_1.NativeUIBundler(ui, bundler_1.nativeUiBundle);
    const sandboxAppPackager = new deploy_1.AppPackager(sandboxRuntimeBundler, nativeUiBundler, ui);
    const nodeAppPackager = new deploy_1.AppPackager(nodeRuntimeBundler, nativeUiBundler, ui);
    const getWebTriggerURLCommand = new get_webtrigger_url_1.GetWebTriggerURLCommand(assertiveAppConfigReader, installationsClient, appEnvironmentClient, webTriggerGraphqlClient);
    const autocompleteController = new autocomplete_controller_1.AutocompleteController(ui);
    const installationsService = new installation_service_1.InstallationService(assertiveAppConfigReader, installationsClient, installationsClient);
    const installView = new install_view_1.InstallView(ui);
    const installController = new install_controller_1.InstallController(assertiveAppConfigReader, configFile, ui, installAppSiteCommand, installationsService, installView, featureFlagService);
    const feedbackController = new feedback_controller_1.FeedbackController(credentialStore, feedbackPostClient);
    const lintService = new lint_service_1.LintService(configFile, fileReader);
    const lintView = new lint_view_1.LintView(ui);
    const lintController = new lint_controller_1.LintController(lintService, lintView);
    const deployView = new deploy_view_1.DeployView(ui);
    const bridgeScriptService = new cli_shared_1.BridgeScriptService();
    const iframeResizerScriptService = new cli_shared_1.IframeResizerScriptService();
    const resourcePackagingService = new resource_packaging_service_1.ResourcePackagingService(archiverFactory, fileReader, process.cwd(), bridgeScriptService, iframeResizerScriptService);
    const sandboxPackageUploadDeployCommand = new deploy_1.PackageUploadDeployCommand(sandboxAppPackager, archiveUploader, deployer, resourcePackagingService);
    const nodePackageUploadDeployCommand = new deploy_1.PackageUploadDeployCommand(nodeAppPackager, archiveUploader, deployer, resourcePackagingService);
    const deployController = new deploy_controller_1.DeployController(assertiveAppConfigReader, configFile, lintService, installationsService, migrationKeysService, customEntitiesService, appEnvironmentClient, deployView, sandboxPackageUploadDeployCommand, nodePackageUploadDeployCommand, createEnvironmentCommand);
    const createSandbox = async (cfg) => new node_runtime_1.NodeSandbox(cfg);
    const functionHost = new tunnel_1.LocalFunctionHost(configFile, ui, null, createSandbox);
    const localInvocationService = new tunnel_1.LocalInvocationService(configFile, ui, runtime_1.notImplementedInspector);
    const startTunnelCommand = new tunnel_1.StartTunnelCommand(assertiveAppConfigReader, new tunnel_1.LocalDevelopmentServer(localInvocationService, ui, configFile, fileReader), new tunnel_1.NgrokCreateTunnelService(ui), new tunnel_1.RegisterTunnelServiceImpl(new tunnel_1.TunnelGraphqlClient(graphQLClient)), functionHost, runtime_1.notImplementedInspector, ui, configFile);
    const tunnelInteractor = new tunnel_1.TunnelInteractor(ui);
    const configFilePortFindingService = new port_finding_service_1.ConfigFilePortFindingService(configFile);
    const tunnelAnalyticsService = new tunnel_analytics_service_1.TunnelAnalyticsService(analyticsClientReporter, cliDetails);
    const nodeTunnelService = new tunnel_service_1.InProcessTunnelService(ui, startTunnelCommand, tunnelInteractor, configFilePortFindingService, cachedConfigService, tunnelAnalyticsService);
    const tunnelView = new tunnel_view_1.TunnelView(ui);
    const localTunnelService = new tunnel_service_1.LocalTunnelService(configFilePortFindingService, cachedConfigService);
    const dockerService = new docker_service_1.DockerService();
    const dockerTunnelService = new tunnel_service_1.DockerTunnelService(configFilePortFindingService, cachedConfigService, dockerService, tunnelAnalyticsService);
    const tunnelController = new tunnel_controller_1.TunnelController(tunnelAnalyticsService, nodeTunnelService, localTunnelService, dockerTunnelService, tunnelView, configFile);
    const stubController = new stubController_1.StubController();
    const prerequisitesController = new prerequisites_controller_1.PrerequisitesController(ui, featureFlagService, cliDetails);
    const defaultEnvironmentController = new default_environment_controller_1.DefaultEnvironmentController(ui, credentialStore, cachedConfigService, assertiveAppConfigReader, loginCommand, createEnvironmentCommand, listEnvironmentCommand, getAppOwnerQuery);
    cmd = command_1.Command.program(ui, analyticsClientReporter, preCommandController, cliDetails, credentialStore, defaultEnvironmentController);
    return {
        ui,
        cmd,
        configFile,
        appConfigProvider: assertiveAppConfigReader,
        graphqlGateway,
        analyticsClientReporter,
        workersStarter,
        commands: {
            loginCommand,
            logoutCommand,
            createAppCommand,
            registerAppCommand,
            installAppSiteCommand,
            uninstallAppCommand,
            getAppOwnerQuery,
            sandboxPackageUploadDeployCommand,
            nodePackageUploadDeployCommand,
            setEnvironmentVariableCommand,
            deleteEnvironmentVariableCommand,
            listEnvironmentVariablesCommand,
            configureProviderCommand,
            createEnvironmentCommand,
            listEnvironmentCommand,
            deleteEnvironmentCommand,
            viewAppLogsCommand,
            getWebTriggerURLCommand,
            listEntitiesIndexesCommand
        },
        services: {
            featureFlagService,
            installationsService,
            migrationKeysService,
            customEntitiesService,
            credentialStore
        },
        controllers: {
            autocompleteController,
            deployController,
            feedbackController,
            installController,
            lintController,
            preCommandController,
            tunnelController,
            settingsController,
            stubController,
            prerequisitesController,
            defaultEnvironmentController
        }
    };
};
exports.getDependencies = getDependencies;
