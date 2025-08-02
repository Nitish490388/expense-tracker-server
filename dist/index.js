"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const players_1 = __importDefault(require("./routes/players"));
const expense_1 = __importDefault(require("./routes/expense"));
const equipment_1 = __importDefault(require("./routes/equipment"));
const matchday_1 = __importDefault(require("./routes/matchday"));
const contribution_1 = __importDefault(require("./routes/contribution"));
const gallery_1 = __importDefault(require("./routes/admin/gallery"));
const gallery_2 = __importDefault(require("./routes/gallery"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("./config/passport");
const verifyUser_1 = __importDefault(require("./middlewares/verifyUser"));
const appRouter_1 = __importDefault(require("./routes/appRouter"));
require("./cron/contributionJob");
const refund_1 = __importDefault(require("./routes/refund"));
const ws_1 = require("ws");
const ensureApproved_1 = require("./middlewares/ensureApproved");
dotenv_1.default.config({
    path: "./.env"
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
const corsOptions = {
    origin: process.env.CORS_URL,
    optionsSuccessStatus: 200
};
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("common"));
const origin = process.env.CORS_URL;
app.use((0, cors_1.default)({
    origin,
    credentials: true,
}));
const secret = process.env.JWT_SECRET;
app.use((0, express_session_1.default)({ secret: secret, resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/auth", auth_1.default);
app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.use("/api/v1/player", players_1.default);
app.use("/api/v1/expence", verifyUser_1.default, ensureApproved_1.ensureApproved, expense_1.default);
app.use("/api/v1/equiment", equipment_1.default);
app.use("/api/v1/matchday", matchday_1.default);
app.use("/api/v1/app", verifyUser_1.default, ensureApproved_1.ensureApproved, appRouter_1.default);
app.use("/api/v1/contributions", verifyUser_1.default, ensureApproved_1.ensureApproved, contribution_1.default);
app.use("/api/v1/refunds", verifyUser_1.default, ensureApproved_1.ensureApproved, refund_1.default);
app.use("/api/v1/admin/gallery", gallery_1.default);
app.use("/api/v1/gallery", gallery_2.default);
const httpServer = app.listen(PORT, () => {
    console.log("Server is started and running at port no: ", PORT);
});
// websocket
const wss = new ws_1.WebSocketServer({ server: httpServer });
exports.wss = wss;
wss.on("connection", (ws) => {
    console.log("🔌 Client connected");
    // ws.send("👋 Hello from the WebSocket server");
    ws.on("message", (message) => {
        console.log("📩 Received:", message.toString());
        ws.send(`Echo: ${message}`);
    });
    ws.on("close", () => {
        console.log("❌ Client disconnected");
    });
});
