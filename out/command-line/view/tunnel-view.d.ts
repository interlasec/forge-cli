/// <reference types="node" />
import { CommandLineUI, exitOnError, UserError } from '@forge/cli-shared';
import { spawn } from 'cross-spawn';
export interface DownloadProgressCallbacks {
    onStart: () => void;
    onSuccess: () => void;
    onFailure: () => void;
}
export declare class TunnelViewError extends UserError {
}
export declare class TunnelView {
    private readonly ui;
    private readonly FAILED_DOCKER_CONNECTION_MESSAGE;
    constructor(ui: CommandLineUI);
    dockerPreamble(environmentKey?: string): void;
    getTunnelErrorHandler(exitFn: typeof exitOnError): (err: Error) => Promise<void>;
    updatePullPercent(dataBuffer: Buffer, dockerPullPercent: number): number;
    calculateProgress(progress: string, regex: RegExp, dockerPullPercent: number, clamp: number): number;
    reportDownloadProgress(imageDownloadChildProcess: ReturnType<typeof spawn>, { onStart, onFailure, onSuccess }: DownloadProgressCallbacks): Promise<void>;
}
//# sourceMappingURL=tunnel-view.d.ts.map