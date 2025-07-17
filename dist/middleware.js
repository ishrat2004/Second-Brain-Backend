"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "Ishratkhan";
//put jwt secret in a third file 
const authMiddleware = (req, res, next) => {
    const token = req.headers.token;
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    if (decoded) {
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }
    else {
        res.status(401).json({
            msg: "Unauthorized access"
        });
    }
};
exports.authMiddleware = authMiddleware;
