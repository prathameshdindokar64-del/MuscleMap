"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseController_1 = require("../controllers/exerciseController");
const router = (0, express_1.Router)();
router.get('/exercises', async (req, res, next) => {
    try {
        (0, exerciseController_1.getExercisesHandler)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=exerciseRoutes.js.map