"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePainHandler = void 0;
const database_1 = require("../db/database");
const painAnalyzer_1 = require("../logic/painAnalyzer");
const uuid_1 = require("uuid");
const analyzePainHandler = (req, res) => {
    const db = (0, database_1.getDatabase)();
    const input = req.body;
    // Check if region exists
    const regionRow = db.prepare('SELECT id FROM regions WHERE id = ?').get(input.region);
    if (!regionRow) {
        return res.status(404).json({ error: 'Region not found' });
    }
    // Analyze
    const output = (0, painAnalyzer_1.analyzePain)(input, db);
    // Save to db
    const id = (0, uuid_1.v4)();
    const insertQuery = `
    INSERT INTO pain_entries (
      id, device_id, region, region_name, pain_type, duration, intensity,
      stress_level, trigger_type, muscles, exercises, risk_level,
      warning_text, disclaimer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db.prepare(insertQuery).run(id, input.deviceId, input.region, output.regionName, input.painType, input.duration, input.intensity, input.stressLevel || null, input.trigger || null, JSON.stringify(output.muscles), JSON.stringify(output.exercises), output.riskLevel, output.warningText, output.disclaimerText);
    return res.json(output);
};
exports.analyzePainHandler = analyzePainHandler;
//# sourceMappingURL=painController.js.map