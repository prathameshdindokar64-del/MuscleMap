"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historySchema = void 0;
const zod_1 = require("zod");
exports.historySchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1, 'Device ID is required')
});
//# sourceMappingURL=historySchema.js.map