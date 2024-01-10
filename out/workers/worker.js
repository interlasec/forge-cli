"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithTimeout = exports.timer = void 0;
const timer = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));
exports.timer = timer;
const handleWithTimeout = async (action, timeout) => {
    await Promise.race([action(), (0, exports.timer)(timeout)]);
};
exports.handleWithTimeout = handleWithTimeout;
