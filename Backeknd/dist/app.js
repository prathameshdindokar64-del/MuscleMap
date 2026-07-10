"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const config_1 = require("./config");
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const regionRoutes_1 = __importDefault(require("./routes/regionRoutes"));
const painRoutes_1 = __importDefault(require("./routes/painRoutes"));
const historyRoutes_1 = __importDefault(require("./routes/historyRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS — allow frontend origin
app.use((0, cors_1.default)({
    origin: config_1.config.allowedOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
// Body parsing
app.use(express_1.default.json());
// Request logging
app.use(requestLogger_1.requestLogger);
// Routes
app.use('/api', healthRoutes_1.default);
app.use('/api', regionRoutes_1.default);
app.use('/api', painRoutes_1.default);
app.use('/api', historyRoutes_1.default);
app.use('/api', exerciseRoutes_1.default);
// Global error handler — must be last
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map