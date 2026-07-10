"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const painController_1 = require("../controllers/painController");
const validateRequest_1 = require("../middleware/validateRequest");
const painSchema_1 = require("../validation/painSchema");
const router = (0, express_1.Router)();
router.post('/analyze-pain', (0, validateRequest_1.validateBody)(painSchema_1.painSchema), async (req, res, next) => {
    try {
        (0, painController_1.analyzePainHandler)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=painRoutes.js.map