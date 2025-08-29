const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (VideoAndShortsCollection) {
  const router = express.Router();

  // ------------------- GET (Read all videos) -------------------
  router.get("/", async (req, res) => {
    try {
      const videos = await VideoAndShortsCollection.find().toArray();
      res.json(videos);
    } catch (err) {
      console.error("GET /header-video-upload error:", err.message);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  // ------------------- POST (Upload new video) -------------------
  router.post("/", async (req, res) => {
    try {
      const { videoURL, category, thumbnailURL } = req.body;
      if (!videoURL || !category || !thumbnailURL) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newVideo = {
        src: videoURL,
        category,
        thumbnail: thumbnailURL,
      };

      const result = await VideoAndShortsCollection.insertOne(newVideo);
      res.status(201).json({
        message: "Video uploaded successfully",
        video: { _id: result.insertedId, ...newVideo },
      });
    } catch (err) {
      console.error("POST /header-video-upload error:", err.message);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });

  // ------------------- PUT (Update video) -------------------
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { src, category, thumbnail } = req.body;

      const result = await VideoAndShortsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { src, category, thumbnail } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Video not found" });
      }

      res.json({ message: "Video updated successfully" });
    } catch (err) {
      console.error("PUT /header-video-upload/:id error:", err.message);
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  // ------------------- DELETE (Delete video) -------------------
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const result = await VideoAndShortsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Video not found" });
      }

      res.json({ message: "Video deleted successfully" });
    } catch (err) {
      console.error("DELETE /header-video-upload/:id error:", err.message);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  return router;
};
