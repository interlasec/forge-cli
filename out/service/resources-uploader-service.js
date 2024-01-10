"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesUploaderService = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
class ResourceUploadError extends cli_shared_1.BaseError {
    constructor(userError = false, requestId) {
        super(requestId, 'Failed to upload resource to S3');
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
class ResourcesUploaderService {
    constructor(fileSystemReader) {
        this.fileSystemReader = fileSystemReader;
    }
    async upload({ archive, preSignedUrl }) {
        const content = this.fileSystemReader.readBinaryFile(archive);
        const formData = new form_data_1.default();
        formData.append('Content-Type', 'application/zip');
        formData.append('acl', 'bucket-owner-full-control');
        Object.entries(preSignedUrl.uploadFormData).forEach(([k, v]) => {
            formData.append(k, v);
        });
        formData.append('file', content);
        const response = await (0, node_fetch_1.default)(preSignedUrl.uploadUrl, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new ResourceUploadError(response.status >= 400 && response.status < 500);
        }
    }
}
exports.ResourcesUploaderService = ResourcesUploaderService;
