import express from "express";
import multer from "multer";
import { createMusic, listMusic } from "../controllers/music.controller.js";
import authArtist from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.get("/", listMusic);
router.post("/upload", authArtist, upload.single("music"), createMusic);

export default router;
