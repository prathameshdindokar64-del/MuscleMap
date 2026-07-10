"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./db/database");
const schema_1 = require("./db/schema");
const config_1 = require("./config");
async function start() {
    // Initialize database
    const db = (0, database_1.initializeDatabase)();
    (0, schema_1.runSchema)(db);
    app_1.default.listen(config_1.config.port, () => {
        console.log(`MuscleMap backend running on http://localhost:${config_1.config.port}`);
        console.log(`Environment: ${config_1.config.nodeEnv}`);
    });
}
start();
//# sourceMappingURL=server.js.map