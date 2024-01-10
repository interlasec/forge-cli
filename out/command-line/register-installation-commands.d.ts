/// <reference types="node" />
import { URL } from 'url';
import { Dependencies } from './dependency-injection';
import { Installation } from '../service/installation-service';
export declare function validateContext({ site, product }: {
    site?: string;
    product?: string;
}): Promise<{
    siteURL?: URL;
    product?: string;
}>;
export declare const performSingleUninstall: (installId: string, { ui, commands: { uninstallAppCommand } }: Dependencies) => Promise<void>;
export declare const performMultipleUninstalls: (appsToUninstall: Installation[], { ui, commands: { uninstallAppCommand } }: Dependencies) => Promise<void>;
export declare const registerCommands: ({ cmd, ...deps }: Dependencies) => void;
//# sourceMappingURL=register-installation-commands.d.ts.map