import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  tracks: [
    {
      title: {
        type: String,
        required: true,
      },
      duration: {
        type: Number, // Duration in seconds
        required: true,
      },
    },
  ],
});

const Album = mongoose.model("Album", albumSchema);

export default Album;