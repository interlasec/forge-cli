import { UI, AddedScope } from '@forge/cli-shared';
import { AppEnvironmentPermissions, Installation } from '../../service/installation-service';
interface InstallOrUpgradeCommandText {
    listScopes: (scopes: AddedScope[]) => string;
    listEgressAddresses: (egressAddresses: string[]) => string;
    permissionsMismatch: (environment: string) => string;
    promptForPermissionsConfirmation: (permissionsMismatchInDevelopment: boolean) => string;
}
export declare class InstallView {
    private readonly ui;
    constructor(ui: UI);
    promptForPermissionsConfirmation({ scopes, egressAddresses }: AppEnvironmentPermissions, addedScopes: AddedScope[], manifestScopes: string[], manifestEgressAddresses: string[], environment: string, confirmScopes: boolean, nonInteractive: boolean, text: InstallOrUpgradeCommandText): Promise<boolean>;
    promptForUpgrade(installations: Installation[]): Promise<Installation>;
}
export {};
//# sourceMappingURL=install-view.d.ts.map