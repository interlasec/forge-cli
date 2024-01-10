import { CreateAppCommandResult, CommandLineUI, CreateAppCommand, FeatureFlagService } from '@forge/cli-shared';
import { Dependencies } from './dependency-injection';
export declare function formatProduct(product: string): string;
export declare function templateMatchesProduct(productName: string, templateName: string, products: (string | null)[]): boolean;
export declare function directoryNameFromAppName(appName?: string): string | undefined;
export interface CreateCommandHandlerOptions {
    template?: string;
    directory?: string;
}
export declare function createCommandHandler(ui: CommandLineUI, createAppCommand: CreateAppCommand, featureFlagService: FeatureFlagService, name: string, { template, directory }: CreateCommandHandlerOptions): Promise<CreateAppCommandResult>;
export declare function registerCommands(deps: Dependencies): void;
//# sourceMappingURL=register-app-commands.d.ts.map