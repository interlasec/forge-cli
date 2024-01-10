"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsClientReporter = void 0;
const tslib_1 = require("tslib");
const analytics_node_client_1 = require("@forge/util/packages/analytics-node-client");
const os = tslib_1.__importStar(require("os"));
const ari_1 = require("@forge/util/packages/ari");
const analytics_message_handler_1 = require("./analytics-message-handler");
const uuid_1 = require("uuid");
const cli_shared_1 = require("@forge/cli-shared");
const unique_machine_id_1 = require("../command-line/unique-machine-id");
const errors_1 = require("../command-line/errors");
const Identity = (value) => value;
function appAidOrUndefined(appAri) {
    try {
        return ari_1.EcosystemAppAri.parse(appAri).appId;
    }
    catch (e) {
        return undefined;
    }
}
class AnalyticsClientReporter {
    constructor(storage, logger, configService) {
        this.storage = storage;
        this.logger = logger;
        this.configService = configService;
        this.source = 'forge/cli';
    }
    reportSuccess(cmdName, cred, attributes) {
        this.processAnalyticsEvent({
            id: (0, uuid_1.v4)(),
            eventType: analytics_message_handler_1.EventType.TRACK,
            event: Object.assign(Object.assign({ timestamp: new Date(), os: {
                    name: os.platform(),
                    version: os.release()
                } }, this._getUserId(cred)), { trackEvent: {
                    source: this.source,
                    action: 'invoked',
                    actionSubject: cmdName,
                    attributes: this._getAttributes(attributes),
                    containers: this._getContainer(attributes)
                } })
        });
    }
    reportFailure(cmdName, cred, attributes, e) {
        attributes = Object.assign(Object.assign({}, attributes), this._getErrorDetails(e));
        this.reportOperationalEvent('invoked', cmdName, cred, attributes);
    }
    reportCommandInvoke(cmdName, cred, attributes) {
        this.reportOperationalEvent('cmdInvoked', cmdName, cred, attributes);
    }
    reportInvokeFailure(cmdName, cred, attributes, e) {
        if (e) {
            attributes = Object.assign(Object.assign({}, attributes), this._getErrorListDetails(e));
        }
        this.reportOperationalEvent('cmdInvokeFailed', cmdName, cred, attributes);
    }
    reportOperationalEvent(action, actionSubject, cred, attributes) {
        this.processAnalyticsEvent({
            id: (0, uuid_1.v4)(),
            eventType: analytics_message_handler_1.EventType.OPERATIONAL,
            event: Object.assign(Object.assign({ timestamp: new Date(), os: {
                    name: os.platform(),
                    version: os.release()
                } }, this._getUserId(cred)), { operationalEvent: {
                    source: this.source,
                    action,
                    actionSubject,
                    attributes: Object.assign({}, this._getAttributes(attributes)),
                    containers: this._getContainer(attributes)
                } })
        });
    }
    processAnalyticsEvent(analyticsEvent) {
        if (this.configService.getAnalyticsPreferences() === false) {
            return;
        }
        if (process.env.FORGE_DEV_DOCKER_TUNNEL || process.env.FORGE_DEV_TUNNEL) {
            this.logger.trace(`\nAnalytics event: ${JSON.stringify(analyticsEvent, null, 2)}`);
        }
        else {
            this.storage.addAnalyticsEvent(analyticsEvent);
        }
    }
    _getUserId(cred) {
        return typeof cred === 'string'
            ? {
                anonymousId: cred
            }
            : {
                userIdType: analytics_node_client_1.userTypes.ATLASSIAN_ACCOUNT,
                userId: cred.accountId
            };
    }
    _getErrorDetails(e) {
        if (e instanceof cli_shared_1.GraphQlMutationError) {
            return { error: e.getCode() };
        }
        return { error: e.constructor.name };
    }
    _getErrorListDetails(e) {
        const errorList = [];
        const errors = e instanceof errors_1.DeferredErrors ? e.getErrors() : [e];
        errors.forEach((error) => {
            if (error instanceof cli_shared_1.GraphQlMutationError) {
                errorList.push(error.getCode());
            }
            else {
                errorList.push(error.constructor.name);
            }
        });
        return { error: errorList.join(',') };
    }
    _asContainer(attrValue, containerType, type, mapper = Identity) {
        const mappedValue = mapper(attrValue);
        return mappedValue
            ? {
                [containerType]: {
                    id: mappedValue,
                    type
                }
            }
            : undefined;
    }
    _nodeVersion() {
        return { node: process.version };
    }
    _machineId() {
        return { machineId: (0, unique_machine_id_1.getMachineId)() };
    }
    _asAttribute(attrValue, name, mapper = Identity) {
        const mappedValue = mapper(attrValue);
        return mappedValue ? { [name]: mappedValue } : {};
    }
    _getAttributes(attributes) {
        return Object.assign(Object.assign(Object.assign(Object.assign({}, attributes), this._asAttribute(attributes.appId, 'appId', appAidOrUndefined)), this._nodeVersion()), this._machineId());
    }
    _getContainer(attributes) {
        return Object.assign(Object.assign(Object.assign({}, this._asContainer(attributes.appId, 'app', 'appId', appAidOrUndefined)), this._asContainer(attributes.appEnv, 'appEnv', 'environment')), this._asContainer(attributes.product, 'product', 'product'));
    }
}
exports.AnalyticsClientReporter = AnalyticsClientReporter;
