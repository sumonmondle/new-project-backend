const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (HeaderSingleVideo) {
  const router = express.Router();

  // Upload (POST)
  router.post("/", async (req, res) => {
    const { iframe } = req.body;
    const match = iframe.match(/src="([^"]+)"/);
    const src = match ? match[1] : null;

    if (!src) return res.status(400).json({ message: "Invalid iframe" });

    const youtubeIdMatch = src.match(/\/embed\/([^?"]+)/);
    const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;
    if (!youtubeId) return res.status(400).json({ message: "Invalid YouTube ID" });

    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    try {
      await HeaderSingleVideo.deleteMany({});
      await HeaderSingleVideo.insertOne({ src, thumbnail, createdAt: new Date() });
      res.json({ message: "Video uploaded", src, thumbnail });
    } catch (error) {
      res.status(500).json({ message: "Database error" });
    }
  });

  // Get (GET)
  router.get("/", async (req, res) => {
    const video = await HeaderSingleVideo.findOne({});
    res.json(video);
  });

  // Update (PUT)
  router.put("/:id", async (req, res) => {
    const { iframe } = req.body;
    const { id } = req.params;

    const match = iframe.match(/src="([^"]+)"/);
    const src = match ? match[1] : null;
    if (!src) return res.status(400).json({ message: "Invalid iframe" });

    const youtubeIdMatch = src.match(/\/embed\/([^?"]+)/);
    const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;
    if (!youtubeId) return res.status(400).json({ message: "Invalid YouTube ID" });

    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    try {
      const result = await HeaderSingleVideo.updateOne(
        { _id: new ObjectId(id) },
        { $set: { src, thumbnail, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json({ message: "Video updated", src, thumbnail });
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  // Delete (DELETE)
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await HeaderSingleVideo.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Video deleted" });
    } catch (err) {
      res.status(500).json({ message: "Deletion failed" });
    }
  });

  return router;
};
