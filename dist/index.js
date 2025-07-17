"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const JWT_SECRET = "Ishratkhan";
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // add bcryopt and zod validation
    ///checking for user existing
    const { username, password } = req.body;
    try {
        yield db_1.UserModel.create({
            username: username,
            password: password
        });
        res.json({
            msg: "User created successfully",
        });
    }
    catch (e) {
        console.log("user already exists");
        res.status(500).json({
            msg: "User already exists or error occurred"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    let user = yield db_1.UserModel.findOne({ username, password });
    if (user) {
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET);
        res.json({
            token: token,
            username: username
        });
    }
    else {
        res.status(401).json({
            msg: "Invalid username or password"
        });
    }
}));
app.post("/api/v1/content", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { title, link, tags,type } = req.body; 
    const title = req.body.title;
    const link = req.body.link;
    const type = req.body.type;
    yield db_1.ContentModel.create({
        title,
        link,
        type,
        //@ts-ignore 
        /// u would have ovverriden the types of request object which is provided by express
        userId: req.userId, // assuming req.userId is set by authMiddleware
        tags: []
    });
    res.json({
        msg: "Content created successfully",
    });
}));
app.get("/api/v1/content", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield db_1.ContentModel.find({
        /// @ts-ignore
        userId: req.userId
    }).populate("userId", "username"); /// gives all the content created by the user incl password,second arg is selector
    res.json({
        content: content
    });
}));
app.delete("/api/v1/content/:id", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in delete");
    const contentId = req.params.id;
    console.log("contentId", contentId);
    yield db_1.ContentModel.deleteMany({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    });
    res.json({
        msg: "deleted successfully"
    });
}));
app.post("/api/v1/brain/share", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                link: `http://localhost:3000/api/v1/brain/${existingLink.hash}`,
            });
            return;
        }
        const hashed_one = (0, utils_1.random)(10);
        yield db_1.LinkModel.create({
            ///@ts-ignore
            userId: req.userId,
            hash: hashed_one
        });
        res.json({
            msg: "Share status updated successfully",
            link: `http://localhost:3000/api/v1/brain/${hashed_one}` // this is the link to share
        });
    }
    else {
        yield db_1.LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            msg: "Share status removed successfully"
        });
    }
    res.json({
        msg: "Updated share status successfully"
    });
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinkModel.findOne({
        hash
    });
    if (!link) {
        res.json({
            msg: "No shared content found for this link"
        });
        return; /// if u dont ts will complain abt link
    }
    /// we got link from the link model, now we can get the content of that user 
    const content = yield db_1.ContentModel.findOne({
        userId: link.userId
    });
    /// we need to get user also 
    const user = yield db_1.UserModel.findOne({
        _id: link.userId
    });
    // check whether user exists or not
    if (!user) {
        res.json({
            msg: "User not found"
        });
        return;
    }
    res.json({
        username: user.username,
        content: content
    });
    ///sequentially we are getting the content 
}));
app.listen(3000);
