const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (AboutUs) {
  const router = express.Router();

  // ✅ POST - নতুন Short আপলোড
  router.post("/", async (req, res) => {
    try {
      const { videoThumbnail, videoURL, caption, user } = req.body;

      if (!videoThumbnail || !videoURL || !caption || !user?.name || !user?.profaction || !user?.avatar) {
        return res.status(400).json({ error: "সব ফিল্ড পূরণ করতে হবে।" });
      }

      const newShort = {
        videoThumbnail,
        videoURL,
        caption,
        user,
        createdAt: new Date(),
      };

      const result = await AboutUs.insertOne(newShort);
      res.status(201).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
      console.error("POST /shorts error:", error.message);
      res.status(500).json({ error: "Short আপলোড ব্যর্থ হয়েছে।" });
    }
  });

  // ✅ GET - সব Shorts দেখাও
  router.get("/", async (req, res) => {
    try {
      const shorts = await AboutUs.find().sort({ createdAt: -1 }).toArray();
      res.json(shorts);
    } catch (error) {
      console.error("GET /shorts error:", error.message);
      res.status(500).json({ error: "Shorts আনতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ DELETE - নির্দিষ্ট ID দিয়ে ডিলিট
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await AboutUs.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Short পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Short ডিলিট হয়েছে।" });
    } catch (error) {
      console.error("DELETE /shorts error:", error.message);
      res.status(500).json({ error: "ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ PUT - নির্দিষ্ট ID-র Short আপডেট করো
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { videoThumbnail, videoURL, caption, user } = req.body;

      if (!videoThumbnail || !videoURL || !caption || !user?.name || !user?.profaction || !user?.avatar) {
        return res.status(400).json({ error: "সব ফিল্ড পূরণ করতে হবে।" });
      }

      const updateDoc = {
        $set: {
          videoThumbnail,
          videoURL,
          caption,
          user,
          updatedAt: new Date(),
        },
      };

      const result = await AboutUs.updateOne({ _id: new ObjectId(id) }, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Short পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Short আপডেট হয়েছে।" });
    } catch (error) {
      console.error("PUT /shorts error:", error.message);
      res.status(500).json({ error: "Short আপডেট ব্যর্থ হয়েছে।" });
    }
  });

  return router;
};
