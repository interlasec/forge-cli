"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutocompleteConfig = exports.Command = exports.WrapperError = void 0;
const tslib_1 = require("tslib");
const commander_1 = tslib_1.__importStar(require("commander"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const cli_shared_1 = require("@forge/cli-shared");
const environment_1 = require("./environment");
const version_info_1 = require("./version-info");
const anon_user_id_1 = require("./anon-user-id");
const errors_1 = require("./errors");
const command_suggestion_service_1 = tslib_1.__importDefault(require("../service/command-suggestion-service"));
const sentry_1 = require("./sentry");
class WrapperError extends commander_1.CommanderError {
    constructor(error, commandName) {
        super(error.exitCode, error.code, error.message);
        this.getCommandName = () => this.commandName;
        this.commandName = commandName;
    }
    getAttributes() {
        return {
            isUserError: true
        };
    }
}
exports.WrapperError = WrapperError;
function last(arg) {
    return arg[arg.length - 1];
}
class Command {
    constructor(ui, analyticsClient, preCommandController, cliDetails, credentialStore, defaultEnvironmentController, { cmd, analyticsName, requiresAuthentication, requiresAnalyticsConsent, requiredOptionFlags, preconditionFn }) {
        this.ui = ui;
        this.analyticsClient = analyticsClient;
        this.preCommandController = preCommandController;
        this.cliDetails = cliDetails;
        this.credentialStore = credentialStore;
        this.defaultEnvironmentController = defaultEnvironmentController;
        this.requiredOptionFlags = [];
        this.preconditionFn = [];
        this.actionProcessor = async (cb, ...args) => {
            var _a, _b, _c;
            const cmdName = this.cmd.name();
            const analyticsName = (_a = this.analyticsName) !== null && _a !== void 0 ? _a : cmdName;
            let cred = (0, anon_user_id_1.getAnonId)(true);
            let attributes = {};
            try {
                if (this.cliDetails) {
                    attributes = {
                        version: this.cliDetails.version,
                        latest: this.cliDetails.latest,
                        isLatest: this.isLatestVersion()
                    };
                }
                this.analyticsClient.reportCommandInvoke(analyticsName, cred, attributes);
                const options = last(args);
                await (0, sentry_1.setSentryCmdOptFlags)(analyticsName, options);
                const nonInteractive = (_b = options.nonInteractive) !== null && _b !== void 0 ? _b : false;
                const json = (_c = options.json) !== null && _c !== void 0 ? _c : false;
                if (nonInteractive) {
                    if (!this.satisfiesNonInteractiveOptions(options)) {
                        throw new cli_shared_1.ValidationError(cli_shared_1.Text.nonInteractive.error.missingRequiredOption(cmdName, this.requiredOptionFlags));
                    }
                }
                if (this.requiresAnalyticsConsent) {
                    await this.preCommandController.verifyAnalyticsPreferences(nonInteractive)();
                }
                if (!json) {
                    this.checkVersion();
                }
                const preconditionCheckAttributes = await this.checkPreconditions(...args);
                Object.assign(options, preconditionCheckAttributes);
                const preconditionAnalyticsAttributes = [
                    ['appId'],
                    ['environment', 'appEnv'],
                    ['siteURL', 'site'],
                    ['product']
                ];
                for (const [preconditionAttribute, analyticsAttribute] of preconditionAnalyticsAttributes) {
                    const value = preconditionCheckAttributes[preconditionAttribute];
                    if (value) {
                        attributes[analyticsAttribute !== null && analyticsAttribute !== void 0 ? analyticsAttribute : preconditionAttribute] = value;
                    }
                }
                const actualCred = await this.checkAuthentication();
                if (actualCred) {
                    cred = actualCred;
                }
                let accountId;
                try {
                    accountId = (await this.credentialStore.getCredentials()).accountId;
                }
                catch (_d) {
                    accountId = 'anonymous';
                }
                await (0, sentry_1.setSentryEnvFlags)(accountId, attributes['appId']);
                const result = await cb(...args);
                if (result) {
                    attributes = Object.assign(Object.assign({}, attributes), result.analytics);
                    if (result.creds) {
                        cred = result.creds;
                    }
                }
                this.analyticsClient.reportSuccess(analyticsName, cred, attributes);
            }
            catch (e) {
                if ((0, cli_shared_1.isErrorWithAnalytics)(e)) {
                    attributes = Object.assign(Object.assign({}, e.getAttributes()), attributes);
                }
                if (attributes.isUserError === undefined) {
                    attributes = Object.assign(Object.assign({}, attributes), { isUserError: false });
                }
                this.analyticsClient.reportInvokeFailure(analyticsName, cred, attributes, e);
                if (e instanceof errors_1.DeferredErrors) {
                    e.getErrors().forEach((error) => this.analyticsClient.reportFailure(analyticsName, cred, attributes, error));
                    process.exit(1);
                }
                else {
                    this.analyticsClient.reportFailure(analyticsName, cred, attributes, e);
                    await (0, cli_shared_1.exitOnError)(this.ui, e);
                }
            }
        };
        this.cmd = cmd || new commander_1.default.Command();
        this.analyticsName = analyticsName;
        this.requiresAuthentication = requiresAuthentication !== null && requiresAuthentication !== void 0 ? requiresAuthentication : true;
        this.requiresAnalyticsConsent = requiresAnalyticsConsent !== null && requiresAnalyticsConsent !== void 0 ? requiresAnalyticsConsent : true;
        this.requiredOptionFlags = requiredOptionFlags !== null && requiredOptionFlags !== void 0 ? requiredOptionFlags : [];
        this.preconditionFn = preconditionFn !== null && preconditionFn !== void 0 ? preconditionFn : [];
        this.cmd.exitOverride((err) => {
            throw new WrapperError(err, this.cmd.name());
        });
        this.cmd.configureOutput({
            writeErr: () => { }
        });
        this.cmd.configureHelp({ sortSubcommands: true });
    }
    get verbose() {
        return this.cmd.opts().verbose;
    }
    static program(ui, analyticsClient, preCommandController, cliDetails, credentialStore, defaultEnvironmentController) {
        var _a;
        const cmd = new Command(ui, analyticsClient, preCommandController, cliDetails, credentialStore, defaultEnvironmentController, {});
        return cmd.version((_a = cliDetails === null || cliDetails === void 0 ? void 0 : cliDetails.version) !== null && _a !== void 0 ? _a : 'unknown', '--version').option('--verbose', cli_shared_1.Text.optionVerbose);
    }
    clone(overrides) {
        return new Command(this.ui, this.analyticsClient, this.preCommandController, this.cliDetails, this.credentialStore, this.defaultEnvironmentController, Object.assign({ cmd: this.cmd, analyticsName: this.analyticsName, requiresAuthentication: this.requiresAuthentication, requiresAnalyticsConsent: this.requiresAnalyticsConsent, requiredOptionFlags: this.requiredOptionFlags, preconditionFn: this.preconditionFn }, overrides));
    }
    version(str, flags) {
        this.cmd.version(str, flags);
        return this;
    }
    command(name, opts) {
        const cmd = this.cmd
            .command(name, opts)
            .allowUnknownOption(false)
            .allowExcessArguments(false);
        const subCommand = new Command(this.ui, this.analyticsClient, this.preCommandController, this.cliDetails, this.credentialStore, this.defaultEnvironmentController, {
            cmd,
            analyticsName: Command.concatenateNames(this.analyticsName, cmd.name())
        }).option('--verbose', cli_shared_1.Text.optionVerbose);
        return subCommand;
    }
    deprecatedCommand(oldName, newName, stubController) {
        this.command(oldName, { hidden: true })
            .requireNoAuthentication()
            .requireNoAnalyticsConsent()
            .action(() => stubController.run({ oldName, newName }));
    }
    description(desc) {
        this.cmd.description(desc);
        return this;
    }
    option(flags, description, defaultValue) {
        this.cmd.option(flags, description, defaultValue);
        return this;
    }
    precondition(fn) {
        return this.clone({ preconditionFn: [...this.preconditionFn, fn] });
    }
    requireManifestFile() {
        return this.precondition(this.preCommandController.verifyManifestExists());
    }
    requireAppId() {
        return this.precondition(this.preCommandController.verifyManifestExistsWithAppConfig());
    }
    nonInteractiveOption(...args) {
        return this.clone({ requiredOptionFlags: args }).option('--non-interactive', cli_shared_1.Text.nonInteractive.description);
    }
    action(fn) {
        this.cmd.action((...args) => {
            args.pop();
            return this.actionProcessor(fn, ...args);
        });
        return this;
    }
    async parse(argv) {
        try {
            this.assertValidArgs(argv);
            await this.cmd.parseAsync(argv);
        }
        catch (err) {
            if (Command.isHelpTriggered(err)) {
                if (Command.isError(err)) {
                    this.outputRelevantHelp(argv);
                }
                return this.reportHelp(err);
            }
            if (Command.isVersionTriggered(err)) {
                return;
            }
            if (Command.isUnknownCommand(err) || Command.isExcessCommands(err)) {
                return this.unknownCommand(argv);
            }
            return await (0, cli_shared_1.exitOnError)(this.ui, err);
        }
    }
    environmentOption() {
        return this.option('-e, --environment [environment]', cli_shared_1.Text.env.option).precondition(async (...args) => {
            const { environment: environmentArg, nonInteractive } = last(args);
            const environment = environmentArg || (await this.defaultEnvironmentController.run(nonInteractive));
            return { environment: (0, environment_1.checkEnvironmentOption)(environment) };
        });
    }
    jsonOption() {
        return this.option('--json', cli_shared_1.Text.optionJson, false);
    }
    requireNoAuthentication() {
        return this.clone({ requiresAuthentication: false });
    }
    requireNoAnalyticsConsent() {
        return this.clone({ requiresAnalyticsConsent: false });
    }
    satisfiesNonInteractiveOptions(options) {
        const optionKeys = Object.keys(options);
        const requiredOptionKeys = [...this.requiredOptionFlags.map((arg) => new commander_1.Option(arg).attributeName())];
        return requiredOptionKeys.every((requiredOption) => optionKeys.includes(requiredOption));
    }
    async checkPreconditions(...args) {
        let attributes = {};
        for (const precondition of this.preconditionFn) {
            const extra = await precondition(...args);
            attributes = Object.assign(Object.assign({}, attributes), extra);
        }
        return attributes;
    }
    async checkAuthentication() {
        if (this.requiresAuthentication) {
            return this.credentialStore.getCredentials();
        }
        return undefined;
    }
    checkVersion() {
        if (!this.cliDetails ||
            !this.cliDetails.latest ||
            !semver_1.default.valid(this.cliDetails.version) ||
            !semver_1.default.valid(this.cliDetails.latest)) {
            return;
        }
        if (semver_1.default.gt(this.cliDetails.latest, this.cliDetails.version)) {
            this.ui.warn(cli_shared_1.Text.error.outdatedCLIVersion(this.cliDetails.version, this.cliDetails.latest));
        }
        else if (semver_1.default.gt(this.cliDetails.version, this.cliDetails.latest)) {
            (0, version_info_1.clearVersionCache)(this.cliDetails.name);
        }
    }
    isLatestVersion() {
        var _a, _b;
        const version = semver_1.default.valid((_a = this.cliDetails) === null || _a === void 0 ? void 0 : _a.version);
        const latest = semver_1.default.valid((_b = this.cliDetails) === null || _b === void 0 ? void 0 : _b.latest);
        if (!version || !latest) {
            return false;
        }
        return semver_1.default.eq(version, latest);
    }
    findLastValidCommand(argv) {
        let command = this.cmd;
        for (const [index, arg] of argv.slice(2).entries()) {
            const commandMatch = command.commands.find((cmd) => cmd.name() === arg);
            if (!commandMatch) {
                return {
                    command,
                    index: index + 1
                };
            }
            command = commandMatch;
        }
        return {
            command,
            index: 1
        };
    }
    outputRelevantHelp(argv) {
        this.findLastValidCommand(argv).command.outputHelp();
    }
    async reportHelp(cmdError) {
        try {
            let cred = (0, anon_user_id_1.getAnonId)(true);
            try {
                cred = await this.credentialStore.getCredentials();
            }
            catch (noTokenError) {
            }
            this.analyticsClient.reportSuccess('help', cred, { command: cmdError.getCommandName() });
        }
        catch (err) {
        }
    }
    async unknownCommand(argv) {
        const errorMessage = [];
        const { command: lastCommand, index: lastCommandIndex } = this.findLastValidCommand(argv);
        const badLastArg = argv[lastCommandIndex + 1];
        const suggestionService = new command_suggestion_service_1.default();
        const suggestions = suggestionService.getSuggestions(badLastArg, lastCommand.commands
            .filter((cmd) => {
            return cmd._hidden !== true;
        })
            .map((cmd) => cmd.name()));
        const errorText = cli_shared_1.Text.invalidCmd(argv.slice(2, lastCommandIndex + 2).join(' '));
        if (suggestions.length) {
            errorMessage.push(`Did you mean:`);
            const suggestionsPrefixed = suggestions.map((suggestion) => [...argv.slice(2, lastCommandIndex + 1), suggestion].join(' '));
            errorMessage.push(suggestionsPrefixed.join('\n'));
        }
        errorMessage.push(cli_shared_1.Text.invalidCmdHelp);
        return await (0, cli_shared_1.exitOnError)(this.ui, new cli_shared_1.UserError(errorText), errorMessage.join('\n\n'));
    }
    assertValidArgs(argv) {
        const args = argv.slice(2);
        let commands = this.cmd.commands;
        while (args[0] && !args[0].startsWith('-')) {
            if (args[0] === 'help') {
                return;
            }
            const commandMatch = commands.find((cmd) => cmd.name() === args[0]);
            if (!commandMatch) {
                throw new commander_1.default.CommanderError(1, 'commander.unknownCommand', `error: unknown command '${args[0]}'.`);
            }
            commands = commandMatch.commands;
            args.shift();
            if (commands.length === 0) {
                break;
            }
        }
    }
    getAutocompleteConfig() {
        return getAutocompleteConfig(this.cmd);
    }
}
exports.Command = Command;
Command.isError = (cmdError) => {
    return cmdError.exitCode === 1;
};
Command.isHelpTriggered = (cmdError) => {
    return ['commander.helpDisplayed', 'commander.help'].includes(cmdError.code);
};
Command.isVersionTriggered = (cmdError) => {
    return 'commander.version' === cmdError.code;
};
Command.isUnknownCommand = (cmdError) => {
    return cmdError.code === 'commander.unknownCommand';
};
Command.isExcessCommands = (cmdError) => {
    return cmdError.code === 'commander.excessArguments';
};
Command.concatenateNames = (parent, subcommand) => {
    return parent ? `${parent}:${subcommand}` : subcommand;
};
const help = new commander_1.default.Help();
function getOptionData(option) {
    let requireUserArg = false;
    if (/<*>/.test(option.flags) || /\[*\]/.test(option.flags)) {
        requireUserArg = true;
    }
    return {
        requireUserArg
    };
}
function getOptionsData(command) {
    const commandOptions = {};
    for (const opt of help.visibleOptions(command)) {
        if (opt.long !== undefined) {
            commandOptions[opt.long] = getOptionData(opt);
        }
    }
    commandOptions['--help'] = {
        requireUserArg: false
    };
    return commandOptions;
}
function getAutocompleteConfig(cmd) {
    const commands = {};
    for (const command of help.visibleCommands(cmd)) {
        if (command.name() === 'help') {
            continue;
        }
        commands[command.name()] = getOptionsData(command);
    }
    const options = getOptionsData(cmd);
    return { commands, options };
}
exports.getAutocompleteConfig = getAutocompleteConfig;
