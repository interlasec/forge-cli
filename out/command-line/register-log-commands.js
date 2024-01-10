"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.parseSinceDateTime = void 0;
const tslib_1 = require("tslib");
const cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
const cli_shared_1 = require("@forge/cli-shared");
const cli_shared_2 = require("@forge/cli-shared");
const cli_shared_3 = require("@forge/cli-shared");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const utc_1 = tslib_1.__importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const DEFAULT_LIMIT = 20;
function parseLimit(limit) {
    const limitNumber = parseInt(limit, 10) || DEFAULT_LIMIT;
    return limitNumber > 0 ? limitNumber : DEFAULT_LIMIT;
}
function parseSinceDateTime(dateTime) {
    let parsed;
    if (dateTime) {
        const since = ['m', 'h', 'd'].includes(dateTime[dateTime.length - 1]);
        if (since) {
            parsed = (0, dayjs_1.default)().subtract(parseInt(dateTime.replace(/\D/g, ''), 10), dateTime.replace(/\d/g, ''));
        }
        else {
            parsed = dayjs_1.default.utc(dateTime);
        }
    }
    return (parsed === null || parsed === void 0 ? void 0 : parsed.isValid()) ? parsed.toISOString() : null;
}
exports.parseSinceDateTime = parseSinceDateTime;
function combineLogParts(message, other) {
    if (other) {
        return message ? [message, ...other] : other;
    }
    else {
        return [message];
    }
}
function logFlat(logger, { id, appVersion, function: fn, trigger, logs }) {
    logs.forEach(({ timestamp, level, message, other }) => {
        logger.info((0, cli_shared_2.formatRuntimeLogLevel)(level) +
            ' ' +
            timestamp +
            ' ' +
            id +
            ' ' +
            (0, cli_shared_2.formatRuntimeLogArgs)(combineLogParts(message, other)));
        logger.debug(`    App version: ${appVersion}`);
        if (fn) {
            logger.debug(`    Function name: ${fn}`);
        }
        if (trigger) {
            logger.debug(`    Function trigger: ${trigger}`);
        }
    });
}
function logGrouped(logger, { id, appVersion, function: fn, trigger, logs }) {
    if (logger.debugEnabled) {
        const table = new cli_table3_1.default(cli_shared_1.TableStyle.runtimeLog);
        table.push({ 'App version': appVersion });
        table.push({ 'Invocation ID': id });
        if (fn) {
            table.push({ 'Function name': fn });
        }
        if (trigger) {
            table.push({ 'Function trigger': trigger });
        }
        logger.debug(table.toString());
        logger.debug('');
    }
    else {
        logger.info(cli_shared_1.LogColor.debug(`invocation: ${id}`));
    }
    logs.forEach(({ timestamp, level, message, other }) => {
        if (logger.debugEnabled) {
            logger.info((0, cli_shared_2.formatRuntimeLogLevel)(level) +
                ' ' +
                timestamp +
                ' ' +
                id +
                ' ' +
                (0, cli_shared_2.formatRuntimeLogArgs)(combineLogParts(message, other)));
            logger.debug(`    App version: ${appVersion}`);
            if (fn) {
                logger.debug(`    Function name: ${fn}`);
            }
            if (trigger) {
                logger.debug(`    Function trigger: ${trigger}`);
            }
        }
        else {
            logger.info((0, cli_shared_2.formatRuntimeLogLevel)(level) +
                ' ' +
                timestamp.split('T')[1] +
                ' ' +
                (0, cli_shared_2.formatRuntimeLogArgs)(combineLogParts(message, other)));
        }
    });
    logger.info('');
}
function logInvocation(logger, invocation, grouped) {
    grouped ? logGrouped(logger, invocation) : logFlat(logger, invocation);
}
const registerCommands = ({ cmd, ui, commands: { viewAppLogsCommand } }) => {
    cmd
        .command('logs')
        .requireAppId()
        .description(cli_shared_3.Text.logs.cmd)
        .environmentOption()
        .option('-i, --invocation <invocation>', cli_shared_3.Text.logs.optionInvocation)
        .option('-n, --limit <limit>', cli_shared_3.Text.logs.optionLimit)
        .option('-s, --since <since>', cli_shared_3.Text.logs.optionSince)
        .option('-g, --grouped', cli_shared_3.Text.logs.optionGroup, false)
        .action(async ({ environment, invocation, limit: limitStr, grouped, since }) => {
        const limit = limitStr ? parseLimit(limitStr) : DEFAULT_LIMIT;
        if (invocation) {
            const log = await viewAppLogsCommand.getOne({
                environmentKey: environment,
                invocationId: invocation
            });
            logInvocation(ui, log, grouped);
        }
        else {
            const startTime = parseSinceDateTime(since);
            if (since && !startTime) {
                ui.warn(cli_shared_3.Text.logs.invalidSinceOption(since));
            }
            const logs = await viewAppLogsCommand.getAll({
                environmentKey: environment,
                limit,
                startTime
            });
            [...logs].reverse().forEach((log) => logInvocation(ui, log, grouped));
        }
    });
};
exports.registerCommands = registerCommands;
