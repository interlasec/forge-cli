import { UserError } from '@forge/cli-shared';
import { spawn } from 'cross-spawn';
export declare class DockerError extends UserError {
    readonly code: DockerErrorCode;
    constructor(message: string, code: DockerErrorCode);
}
export interface DockerVersion {
    full: string;
    major: number;
    minor: number;
}
export declare const DOCKER_DOWNLOAD_LINK = "https://docs.docker.com/get-docker/";
export declare enum DockerErrorCode {
    DAEMON_NOT_RUNNING = 0,
    NOT_INSTALLED = 1
}
export declare class DockerService {
    runContainer(args: string[]): ReturnType<typeof spawn>;
    getDockerVersion(debugEnabled: boolean): Promise<DockerVersion>;
    removeContainer(containerName: string): Promise<void>;
    downloadImage(imageName: string): ReturnType<typeof spawn>;
    startCleanupWorker(pids: number[], containerName: string): void;
    private execPromise;
}
//# sourceMappingURL=docker-service.d.ts.map