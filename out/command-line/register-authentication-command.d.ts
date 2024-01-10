import { PersonalApiCredentialsValidated } from '@forge/cli-shared';
import { CommandLineUI, LoginCommand } from '@forge/cli-shared';
import { Dependencies } from './dependency-injection';
export interface LoginCommandOptions {
    email?: string;
    token?: string;
}
export declare function loginCommandHandler(ui: CommandLineUI, instructionsUrl: string, loginCommand: LoginCommand, { email, token }: LoginCommandOptions): Promise<{
    creds: PersonalApiCredentialsValidated;
    analytics: {
        userId: string;
        anonymousId: string | undefined;
    };
}>;
export declare function registerCommands(deps: Dependencies): void;
//# sourceMappingURL=register-authentication-command.d.ts.map