const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (Influencer) {
  const router = express.Router();

  // ✅ POST - নতুন Influencer আপলোড
  router.post("/", async (req, res) => {
    try {
      const { name, role, image, view, subs } = req.body;

      if (!name || !role || !image) {
        return res.status(400).json({ error: "Name, Role এবং Image দিতে হবে।" });
      }

      const newInfluencer = {
        name,
        role,
        image,
        view: view || "0 Views",
        subs: subs || "0 Subs",
        createdAt: new Date(),
      };

      const result = await Influencer.insertOne(newInfluencer);
      res.status(201).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
      console.error("POST /influencers error:", error.message);
      res.status(500).json({ error: "Influencer আপলোড ব্যর্থ হয়েছে।" });
    }
  });

  // ✅ GET - সব Influencer দেখাও
  router.get("/", async (req, res) => {
    try {
      const influencers = await Influencer.find().sort({ createdAt: -1 }).toArray();
      res.json(influencers);
    } catch (error) {
      console.error("GET /influencers error:", error.message);
      res.status(500).json({ error: "Influencer আনতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ DELETE - নির্দিষ্ট ID দিয়ে ডিলিট
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Influencer.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Influencer পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Influencer ডিলিট হয়েছে।" });
    } catch (error) {
      console.error("DELETE /influencers error:", error.message);
      res.status(500).json({ error: "ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ PUT - নির্দিষ্ট ID-র Influencer আপডেট করো
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name, role, image, view, subs } = req.body;

      if (!name || !role || !image) {
        return res.status(400).json({ error: "Name, Role এবং Image দিতে হবে।" });
      }

      const updateDoc = {
        $set: {
          name,
          role,
          image,
          view,
          subs,
          updatedAt: new Date(),
        },
      };

      const result = await Influencer.updateOne({ _id: new ObjectId(id) }, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Influencer পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Influencer আপডেট হয়েছে।" });
    } catch (error) {
      console.error("PUT /influencers error:", error.message);
      res.status(500).json({ error: "Influencer আপডেট ব্যর্থ হয়েছে।" });
    }
  });

  return router;
};
