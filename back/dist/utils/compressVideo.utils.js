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
exports.compressVideo = exports.commandToCompressVideo = exports.getMetadataVideo = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const path_1 = __importDefault(require("path"));
const ffprobe_static_1 = require("ffprobe-static");
function getMetadataVideo(path) {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(path, (err, metadata) => {
            if (err) {
                reject(err);
            }
            resolve(metadata);
        });
    });
}
exports.getMetadataVideo = getMetadataVideo;
function commandToCompressVideo(input, output, callback) {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(input)
            .outputOptions(["-vcodec libx264", "-crf 28", "-preset slow"])
            .output(output)
            .on("start", (command) => {
            console.log(command);
        })
            .on("progress", (progress) => {
            callback(progress.percent);
        })
            .on("error", (error) => {
            console.log("======== ERROR COMPRESSION =======", error);
            reject(false);
        })
            .on("end", () => {
            console.log("========== DONE COMPRESSION ========", output);
            resolve(true);
        })
            .run();
    });
}
exports.commandToCompressVideo = commandToCompressVideo;
const compressVideo = (inputVideo, outputDir, filename, callback) => __awaiter(void 0, void 0, void 0, function* () {
    fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
    fluent_ffmpeg_1.default.setFfprobePath(ffprobe_static_1.path);
    const outPutVideo = path_1.default.join(outputDir, `${filename}.mp4`);
    const inputMetadata = yield getMetadataVideo(inputVideo);
    yield commandToCompressVideo(inputVideo, outPutVideo, (progress) => {
        callback(progress);
    });
    const outputMetadata = yield getMetadataVideo(outPutVideo);
    return {
        oldSize: inputMetadata.format.size,
        newSize: outputMetadata.format.size,
        filename: `${filename}.mp4`,
    };
});
exports.compressVideo = compressVideo;
