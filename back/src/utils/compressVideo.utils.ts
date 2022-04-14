import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import { path as ffprobePath } from "ffprobe-static";

export function getMetadataVideo(path: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err: any, metadata: FfprobeData) => {
      if (err) {
        reject(err);
      }
      resolve(metadata);
    });
  });
}

export function commandToCompressVideo(
  input: string,
  output: string,
  callback?: (progress: number) => void
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions(["-vcodec libx264", "-crf 28", "-preset faster"])
      .output(output)
      .on("start", (command) => {
        console.log(command);
      })
      .on("progress", (progress) => {
        callback && callback(progress.percent);
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

export interface CompressVideoOuput {
  oldSize?: number;
  newSize?: number;
  filename: string;
}

export const compressVideo = async (
  inputVideo: string,
  outputDir: string,
  filename: string,
  callback: (progress: number) => void
): Promise<CompressVideoOuput> => {
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  const outPutVideo = path.join(outputDir, `${filename}.mp4`);
  const inputMetadata = await getMetadataVideo(inputVideo);
  await commandToCompressVideo(inputVideo, outPutVideo, (progress) => {
    callback(progress);
  });
  const outputMetadata = await getMetadataVideo(outPutVideo);
  return {
    oldSize: inputMetadata.format.size,
    newSize: outputMetadata.format.size,
    filename: `${filename}.mp4`,
  };
};
