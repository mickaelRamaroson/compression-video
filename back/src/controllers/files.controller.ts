import { Request, Response } from "express";
import path from "path";
import fs from "fs";

interface FileOutput {
  name: string;
  last_modified: Date;
  size: number;
  filename: string;
}

const getFilesInDirectory = async (dir: string): Promise<FileOutput[]> => {
  const files = await fs.promises.readdir(dir);
  return files
    .map((filename) => {
      const file = fs.statSync(`${dir}/${filename}`);
      return {
        name: filename.split("my-id")[1],
        filename,
        last_modified: file.mtime,
        size: file.size,
      };
    })
    .sort(
      (a, b) =>
        (new Date(b.last_modified) as any) - (new Date(a.last_modified) as any)
    );
};

export const getAllFiles = async (_req: Request, res: Response) => {
  // I get all files existing in the compressed-videos directory
  const files = await getFilesInDirectory(
    path.join(process.cwd(), "compressed-videos")
  );
  res.status(200).json(files);
};

export const streamVideo = async (req: Request, res: Response) => {
  const { range } = req.headers;
  const { filename } = req.params;
  const videoPath = path.join(process.cwd(), "compressed-videos", filename);
  if (range) {
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } else {
    res.status(400).send("The header Range is required.");
  }
};
