import musicModel from "../models/music.model.js";
import { uploadFile } from "../services/storage.service.js";

async function createMusic(req, res) {
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
      artist: req.user.id,
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

async function listMusic(req, res) {
  try {
    const music = await musicModel
      .find()
      .sort({ _id: -1 })
      .populate("artist", "username");

    return res.status(200).json({ music });
  } catch (error) {
    console.error("Music library error:", error);
    return res.status(500).json({ message: "Unable to load music library" });
  }
}

export { createMusic, listMusic };


