const jwt = require("jsonwebtoken");

async function authArtist (req, res, next) {
    const token = req.body.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "artist") {
            return res.status(403).json({ message: "You don't have permission to create an album" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Authentication failed" });
    }
}

module.exports = authArtist;