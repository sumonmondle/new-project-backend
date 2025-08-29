const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const adminAuthRoutes = require("./adminLogin/adminAuth");
const headerVideoRoutes = require("./routes/headerVideoRoutes");
const aboutUs = require("./routes/aboutUs");
const videoAndShorts = require("./routes/videoAndShorts");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;

// MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



// Mail Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("lumenza");
    const MonthlyKeepAlive = db.collection("MonthlyKeepAlive");
    const collection = db.collection("admin");
    const HeaderSingleVideo = db.collection("HeaderSingleVideo");

    const AboutUs = db.collection("AboutUs");

    const VideoAndShortsCollection = db.collection("VideoAndShorts");



    // Test Route
    app.get("/", (req, res) => {
      res.send("Hello from Admin Backend");
    });
    // ✅ Admin Auth Routes (imported)
    adminAuthRoutes(app, collection, transporter, process.env.EMAIL_USER);
    app.use("/header-video", headerVideoRoutes(HeaderSingleVideo));
    app.use("/about-us", aboutUs(AboutUs));
    app.use("/header-video-upload", videoAndShorts(VideoAndShortsCollection));







    // Monthly cron with new collection
    cron.schedule("0 2 1 * *", async () => {
      try {
        const now = new Date();
        const dummyData = {
          message: "Monthly auto insert to keep DB active",
          createdAt: now,
        };
        await MonthlyKeepAlive.insertOne(dummyData);
      } catch (error) {
        console.error("Error inserting monthly data:", error);
      }
    });

    // Start Server
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run().catch(console.dir);
