"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegionsHandler = void 0;
const database_1 = require("../db/database");
const getRegionsHandler = (req, res) => {
    const db = (0, database_1.getDatabase)();
    const regions = db.prepare('SELECT id, name, description FROM regions ORDER BY name').all();
    return res.json(regions);
};
exports.getRegionsHandler = getRegionsHandler;
//# sourceMappingURL=regionController.js.map