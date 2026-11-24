import express from "express";
import multer from "multer";
import { createMusic } from "../controllers/music.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.post("/upload", upload.single("music"), createMusic);

export default router;
