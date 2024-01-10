/// <reference types="node" />
import { Logger, UserError } from '@forge/cli-shared';
export interface Archiver {
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    finalise(): Promise<string>;
}
export declare class ArchiverError extends UserError {
}
export declare class ZipArchiver implements Archiver {
    private readonly logger;
    private archive;
    private tempFile;
    private resolves;
    private rejects;
    constructor(logger: Logger);
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    finalise(): Promise<string>;
    onWarning(cb: (err: Error) => void): void;
    private onArchiveError;
    private onClose;
}
export declare class DirectoryArchiver implements Archiver {
    private directory;
    private readonly logger;
    constructor(directory: string, logger: Logger);
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    private copy;
    finalise(): Promise<string>;
}
export declare class MultiArchiver implements Archiver {
    private readonly archivers;
    constructor(archivers: Archiver[]);
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    finalise(): Promise<string>;
}
export declare function makeArchiver(logger: Logger): Archiver;
//# sourceMappingURL=archiver.d.ts.map