"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const regionController_1 = require("../controllers/regionController");
const router = (0, express_1.Router)();
router.get('/regions', async (req, res, next) => {
    try {
        (0, regionController_1.getRegionsHandler)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=regionRoutes.js.map