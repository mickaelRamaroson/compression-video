import { Router } from "express";
import { getAllFiles, streamVideo } from "../controllers/files.controller";
const router = Router();

router.get("/", getAllFiles);
router.get("/:filename", streamVideo);

export default router;
