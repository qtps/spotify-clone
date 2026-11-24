import jwt from "jsonwebtoken";

function authArtist(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "artist") {
      return res
        .status(403)
        .json({ message: "You don't have permission to upload music" });
    }

    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export default authArtist;