import mongoose from "mongoose";
import albumModel from "./album.model.js";
import jwt from "jsonwebtoken";

const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});


async function createAlbum(req, res) {
  const token = req.body.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "artist") {
      return res
        .status(403)
        .json({ message: "You don't have permission to create an album" });
    }

    const { title, releaseDate, genre, tracks } = req.body;
    const album = new albumModel({
      title,
      artist: decoded.id,
      releaseDate,
      genre,
      tracks,
    });
    await album.save();
    return res.status(201).json({ message: "Album created successfully", album });
  } catch (error) {
    console.error("Album creation error:", error);
    return res.status(500).json({ message: "Album creation failed" });
  }
}

const musicModel = mongoose.model("music", musicSchema);

export default musicModel;
