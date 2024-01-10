import commander, { CommanderError } from 'commander';
import { CamelCase } from 'type-fest';
import { AnalyticsClientReporter } from '../analytics-client/analytics-client';
import { Logger, CLIDetails, CredentialGetter, PersonalApiCredentialsValidated, ErrorWithAnalytics, ErrorAnalytics } from '@forge/cli-shared';
import { PreCommandController } from './controller/pre-command-controller';
import * as autocomplete from '../autocomplete/types';
import { StubController } from './controller/stubController';
import { DefaultEnvironmentController } from './controller/default-environment-controller';
declare type ActionResult = Promise<{
    creds?: PersonalApiCredentialsValidated;
    analytics: any;
} | void>;
export declare class WrapperError extends CommanderError implements ErrorWithAnalytics {
    private readonly commandName;
    constructor(error: CommanderError, commandName: string);
    getCommandName: () => string;
    getAttributes(): ErrorAnalytics;
}
declare type AnyOpts = {};
declare type ParseOpts<OptsStr extends string, Default extends string | boolean | undefined = undefined> = OptsStr extends `-${infer _}, --${infer Rest}` ? ParseOpts<`--${Rest}`, Default> : OptsStr extends `--${infer Flag} [${infer _}...]` ? {
    [k in CamelCase<Flag>]: [string] | Default;
} : OptsStr extends `--${infer Flag} <${infer _}...>` ? {
    [k in CamelCase<Flag>]: [string] | Default;
} : OptsStr extends `--${infer Flag} [${infer _}]` ? {
    [k in CamelCase<Flag>]: string | Default;
} : OptsStr extends `--${infer Flag} <${infer _}>` ? {
    [k in CamelCase<Flag>]: string | Default;
} : OptsStr extends `--no-${infer Flag}` ? Default extends undefined ? {
    [k in CamelCase<Flag>]: boolean;
} : never : OptsStr extends `--${infer Flag}` ? Default extends boolean ? {
    [k in CamelCase<Flag>]: boolean;
} : Default extends undefined ? {
    [k in CamelCase<Flag>]?: boolean;
} : never : never;
export declare type DefaultOpts = {
    verbose?: boolean;
};
declare type AnyArgs = string[];
declare type ParseArgs<ArgsStr extends string> = ArgsStr extends `${infer _} ${infer Rest}` ? [string, ...ParseArgs<Rest>] : [];
declare type ActionArgs<Args extends AnyArgs, Opts extends AnyOpts> = [...Args, Opts];
declare type PreconditionCallback<Args extends AnyArgs, Opts extends AnyOpts, MoreOpts> = (...args: ActionArgs<Args, Opts>) => Promise<MoreOpts>;
export declare class Command<Args extends AnyArgs = [], Opts extends AnyOpts = DefaultOpts> {
    private readonly ui;
    private readonly analyticsClient;
    private readonly preCommandController;
    private readonly cliDetails;
    private readonly credentialStore;
    private readonly defaultEnvironmentController;
    get verbose(): boolean;
    private static isError;
    private static isHelpTriggered;
    private static isVersionTriggered;
    private static isUnknownCommand;
    private static isExcessCommands;
    private static concatenateNames;
    private readonly cmd;
    private readonly analyticsName;
    private readonly requiresAuthentication;
    private readonly requiresAnalyticsConsent;
    private readonly requiredOptionFlags;
    private readonly preconditionFn;
    static program(ui: Logger, analyticsClient: AnalyticsClientReporter, preCommandController: PreCommandController, cliDetails: CLIDetails | undefined, credentialStore: CredentialGetter, defaultEnvironmentController: DefaultEnvironmentController): Command<[], DefaultOpts>;
    private constructor();
    private clone;
    version(str: string, flags?: string): Command<Args, Opts>;
    command<ArgsStr extends string>(name: ArgsStr, opts?: commander.CommandOptions): Command<ParseArgs<ArgsStr>, DefaultOpts>;
    deprecatedCommand(oldName: string, newName: string, stubController: StubController): void;
    description(desc: string): Command<Args, Opts>;
    option<OptsStr extends string, Default extends string | boolean | undefined = undefined>(flags: OptsStr, description: string, defaultValue?: Default): Command<Args, Opts & ParseOpts<OptsStr, Default>>;
    precondition(fn: PreconditionCallback<Args, Opts, void>): Command<Args, Opts>;
    precondition<More extends AnyOpts>(fn: PreconditionCallback<Args, Opts, More>): Command<Args, Opts & More>;
    requireManifestFile(): Command<Args, Opts>;
    requireAppId(): Command<Args, Opts>;
    nonInteractiveOption(...args: string[]): Command<Args, Opts & {
        nonInteractive?: boolean;
    }>;
    action(fn: (...args: ActionArgs<Args, Opts>) => ActionResult): Command<Args, Opts>;
    parse(argv: string[]): Promise<void>;
    environmentOption(): Command<Args, Opts & {
        environment: string;
    }>;
    jsonOption(): Command<Args, Opts & {
        json: boolean;
    }>;
    requireNoAuthentication(): Command<Args, Opts>;
    requireNoAnalyticsConsent(): Command<Args, Opts>;
    private satisfiesNonInteractiveOptions;
    actionProcessor: (cb: (...cbArgs: ActionArgs<Args, Opts>) => ActionResult, ...args: ActionArgs<Args, Opts>) => Promise<void>;
    private checkPreconditions;
    private checkAuthentication;
    private checkVersion;
    private isLatestVersion;
    private findLastValidCommand;
    outputRelevantHelp(argv: string[]): void;
    reportHelp(cmdError: WrapperError): Promise<void>;
    private unknownCommand;
    private assertValidArgs;
    getAutocompleteConfig(): autocomplete.AutocompleteConfig;
}
export declare function getAutocompleteConfig(cmd: commander.Command): autocomplete.AutocompleteConfig;
export {};
//# sourceMappingURL=command.d.ts.map