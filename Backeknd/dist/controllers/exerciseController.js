"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExercisesHandler = void 0;
const database_1 = require("../db/database");
const getExercisesHandler = (req, res) => {
    const db = (0, database_1.getDatabase)();
    const regionId = req.query.regionId;
    const painType = req.query.painType;
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];
    if (regionId) {
        query += ' AND region_id = ?';
        params.push(regionId);
    }
    if (painType) {
        query += ' AND pain_types LIKE ?';
        params.push(`%"${painType}"%`);
    }
    const exercises = db.prepare(query).all(...params);
    // parse JSON strings before sending
    const parsed = exercises.map((e) => ({
        ...e,
        tags: JSON.parse(e.tags),
        pain_types: JSON.parse(e.pain_types)
    }));
    return res.json(parsed);
};
exports.getExercisesHandler = getExercisesHandler;
//# sourceMappingURL=exerciseController.js.map