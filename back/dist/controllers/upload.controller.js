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
exports.upload = void 0;
const compressVideo_utils_1 = require("../utils/compressVideo.utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uniqid_1 = __importDefault(require("uniqid"));
const mvFile = (file) => {
    return new Promise((resolve, reject) => {
        const fileName = (0, uniqid_1.default)() + "my-id" + file.name;
        file.mv("tmp/" + fileName, (error) => {
            if (error) {
                reject(null);
            }
            resolve(fileName);
        });
    });
};
const upload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const socket = req.io;
    const { request_id } = req.query;
    const filesReq = req.files;
    const file = filesReq && filesReq[""];
    const fileName = yield mvFile(file);
    const fileNameWithoutExtension = fileName.replace(`.${file.mimetype.split("/")[1]}`, "");
    res.status(200).json({ message: "uploaded successfully !!!" });
    // create compressed-videos dir
    const compressedVideosDir = path_1.default.join(process.cwd(), "compressed-videos");
    if (!fs_1.default.existsSync(compressedVideosDir)) {
        fs_1.default.mkdirSync(compressedVideosDir, { recursive: true });
    }
    const videoInputPath = path_1.default.join(process.cwd(), "tmp", fileName);
    // compress video
    const resutCompression = yield (0, compressVideo_utils_1.compressVideo)(videoInputPath, compressedVideosDir, fileNameWithoutExtension, (progress) => {
        socket.emit("on-progress-compression", {
            request_id,
            progress,
        });
    });
    if (resutCompression) {
        // delete tmp file after compression
        fs_1.default.unlink(path_1.default.join(process.cwd(), "tmp", fileName), () => {
            console.log("The temp file is deleted.");
        });
        socket.emit("on-end-compression", { request_id, result: resutCompression });
    }
    else {
        socket.emit("on-error-compression", { request_id });
    }
});
exports.upload = upload;
