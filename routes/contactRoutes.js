const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (Contract) {
  const router = express.Router();

  // ✅ POST - নতুন Contact Form data save
  router.post("/", async (req, res) => {
    try {
      const { client_name, client_email, w_service, w_budget, project_desc } = req.body;

      if (!client_name || !client_email || !w_service || !w_budget || !project_desc) {
        return res.status(400).json({ error: "সব ফিল্ড পূরণ করতে হবে।" });
      }

      const newContact = {
        client_name,
        client_email,
        w_service,
        w_budget,
        project_desc,
        createdAt: new Date(),
      };

      const result = await Contract.insertOne(newContact);
      res.send(result)
    } catch (error) {
      console.error("POST /contact error:", error.message);
      res.status(500).json({ error: "Contact form সংরক্ষণ ব্যর্থ হয়েছে।" });
    }
  });

  // ✅ GET - সব Contact Data দেখাও
  router.get("/", async (req, res) => {
    try {
      const contacts = await Contract.find().sort({ createdAt: -1 }).toArray();
      res.json(contacts);
    } catch (error) {
      console.error("GET /contact error:", error.message);
      res.status(500).json({ error: "Contact data আনতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ GET - নির্দিষ্ট Contact by ID
  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const contact = await Contract.findOne({ _id: new ObjectId(id) });

      if (!contact) {
        return res.status(404).json({ error: "এই ID-র Contact পাওয়া যায়নি।" });
      }

      res.json(contact);
    } catch (error) {
      console.error("GET /contact/:id error:", error.message);
      res.status(500).json({ error: "একক Contact আনতে সমস্যা হয়েছে।" });
    }
  });

  // ✅ PUT - নির্দিষ্ট ID দিয়ে Update
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { client_name, client_email, w_service, w_budget, project_desc } = req.body;

      if (!client_name || !client_email || !w_service || !w_budget || !project_desc) {
        return res.status(400).json({ error: "সব ফিল্ড পূরণ করতে হবে।" });
      }

      const updateDoc = {
        $set: {
          client_name,
          client_email,
          w_service,
          w_budget,
          project_desc,
          updatedAt: new Date(),
        },
      };

      const result = await Contract.updateOne({ _id: new ObjectId(id) }, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Contact পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Contact আপডেট হয়েছে।" });
    } catch (error) {
      console.error("PUT /contact error:", error.message);
      res.status(500).json({ error: "Contact আপডেট ব্যর্থ হয়েছে।" });
    }
  });

  // ✅ DELETE - নির্দিষ্ট ID দিয়ে ডিলিট
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Contract.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "এই ID-র Contact পাওয়া যায়নি।" });
      }

      res.json({ success: true, message: "Contact ডিলিট হয়েছে।" });
    } catch (error) {
      console.error("DELETE /contact error:", error.message);
      res.status(500).json({ error: "ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  return router;
};
