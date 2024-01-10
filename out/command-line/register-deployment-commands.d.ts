import { Dependencies } from './dependency-injection';
export interface DeploymentResult {
    analytics: {
        moduleList?: string[];
        hostedResourceList: {
            rawSize: string;
            zipSize: string;
            extensionList: string[];
            fileCount: number;
        }[];
        egressPermissionList?: {
            type: string;
            domains: string[] | undefined;
        }[];
        connectKey?: {
            action?: string;
            value?: string;
        };
    };
}
export declare const registerCommands: ({ cmd, controllers: { deployController } }: Dependencies) => void;
//# sourceMappingURL=register-deployment-commands.d.ts.map