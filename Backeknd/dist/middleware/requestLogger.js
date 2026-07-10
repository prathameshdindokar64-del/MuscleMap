"use strict";
/**
 * Request logging middleware using Morgan.
 * Uses 'dev' format in development and 'combined' in production.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("../config");
/** Morgan request logger configured per environment */
exports.requestLogger = (0, morgan_1.default)(config_1.config.isDev ? 'dev' : 'combined');
//# sourceMappingURL=requestLogger.js.map