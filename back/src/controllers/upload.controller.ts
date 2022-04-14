import { Request, Response } from "express";
import { compressVideo } from "../utils/compressVideo.utils";
import path from "path";
import fs from "fs";
import uniqid from "uniqid";

const mvFile = (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = uniqid() + "my-id" + file.name;
    file.mv("tmp/" + fileName, (error: Error) => {
      if (error) {
        reject(null);
      }
      resolve(fileName);
    });
  });
};

export const upload = async (req: Request, res: Response) => {
  const socket = (req as any).io;
  const { request_id } = req.query;
  const filesReq = req.files;
  const file = filesReq && filesReq.file;
  const fileName = await mvFile(file);

  const fileNameWithoutExtension = fileName.replace(
    `.${(file as any).mimetype.split("/")[1]}`,
    ""
  );

  res.status(200).json({ message: "uploaded successfully !!!" });

  // create compressed-videos dir
  const compressedVideosDir = path.join(process.cwd(), "compressed-videos");
  if (!fs.existsSync(compressedVideosDir)) {
    fs.mkdirSync(compressedVideosDir, { recursive: true });
  }

  const videoInputPath = path.join(process.cwd(), "tmp", fileName);

  // compress video
  const resutCompression = await compressVideo(
    videoInputPath,
    compressedVideosDir,
    fileNameWithoutExtension,
    (progress: number) => {
      socket.emit(`on-progress-compression-${request_id}`, Math.ceil(progress));
    }
  );

  if (resutCompression) {
    // delete tmp file after compression
    fs.unlink(path.join(process.cwd(), "tmp", fileName), () => {
      console.log("The temp file is deleted.");
    });
    socket.emit(`on-end-compression-${request_id}`, resutCompression);
    socket.emit("update-list");
  } else {
    socket.emit(`on-error-compression-${request_id}`, {});
  }
};
