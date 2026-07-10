"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthHandler = void 0;
const getHealthHandler = (req, res) => {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
exports.getHealthHandler = getHealthHandler;
//# sourceMappingURL=healthController.js.map