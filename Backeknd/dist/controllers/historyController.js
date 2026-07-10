"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryHandler = void 0;
const database_1 = require("../db/database");
const getHistoryHandler = (req, res) => {
    const db = (0, database_1.getDatabase)();
    const deviceId = req.query.deviceId;
    const entries = db.prepare(`
    SELECT * FROM pain_entries
    WHERE device_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).all(deviceId);
    const historyItems = entries.map(entry => ({
        id: entry.id,
        timestamp: entry.created_at,
        region: entry.region,
        regionName: entry.region_name,
        intensity: entry.intensity,
        riskLevel: entry.risk_level,
        result: {
            regionName: entry.region_name,
            muscles: JSON.parse(entry.muscles),
            exercises: JSON.parse(entry.exercises),
            riskLevel: entry.risk_level,
            warningText: entry.warning_text,
            disclaimerText: entry.disclaimer
        }
    }));
    return res.json(historyItems);
};
exports.getHistoryHandler = getHistoryHandler;
//# sourceMappingURL=historyController.js.map