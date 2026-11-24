import musicModel from "../models/music.model.js";
import { uploadFile } from "../services/storage.service.js";
import jwt from "jsonwebtoken";

async function createMusic(req, res) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "You don't have access to create music" });
  }

  if (decoded.role !== "artist") {
    return res
      .status(403)
      .json({ message: "You don't have permission to create music" });
  }

  const title = req.body?.title;
  const file = req.file;

  if (typeof title !== "string" || !title.trim() || !file) {
    return res.status(400).json({ message: "title and file are required" });
  }

  try {
    const result = await uploadFile(file.buffer.toString("base64"));
    const music = await musicModel.create({
      title: title.trim(),
      uri: result.url,
      artist: decoded.id,
    });

    return res.status(201).json({
      message: "Music created successfully",
      music: {
        id: music._id,
        title: music.title,
        uri: music.uri,
        artist: music.artist,
      },
    });
  } catch (error) {
    console.error("Music upload error:", error);
    return res.status(500).json({ message: "Music upload failed" });
  }
}

export {
  createMusic,
};


