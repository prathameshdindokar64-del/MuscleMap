"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historyController_1 = require("../controllers/historyController");
const validateRequest_1 = require("../middleware/validateRequest");
const historySchema_1 = require("../validation/historySchema");
const router = (0, express_1.Router)();
router.get('/history', (0, validateRequest_1.validateQuery)(historySchema_1.historySchema), async (req, res, next) => {
    try {
        (0, historyController_1.getHistoryHandler)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=historyRoutes.js.map