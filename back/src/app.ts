import express, { Application, Request, NextFunction, Response } from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import cors from "cors";
import * as socketIo from "socket.io";
// routers
import uploadRoute from "./routes/upload.route";
import filesRoute from "./routes/files.route";

// create temp directory
const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const app: Application = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "100000mb", extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(process.cwd(), "tmp"),
  })
);
app.use(cors()); // handle cors

//create server
const server = createServer(app);

// config socket.io
const io = new socketIo.Server(server, { cors: { origin: "*" } });
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).io = io;
  return next();
});

// routes declaration
app.use("/upload", uploadRoute);
app.use("/files", filesRoute);

export default server;
