// adminLogin/adminAuth.js

const { ObjectId } = require("mongodb");

// OTP generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function adminAuthRoutes(app, collection, transporter, emailUser) {
  // ✅ Request OTP
  app.post("/admin/request-login", async (req, res) => {
    const { email } = req.body;

    if (email !== "sudiptabiswas506@gmail.com" && email !== "sumonmondle@gmail.com" && email !== "sidubiswas6@gmail.com") {
      return res.status(403).json({ message: "Only admin can request login" });
    }

    const otp = generateOTP();

    await collection.updateOne(
      { email },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    const htmlTemplate = `
      <div style="max-width:600px;margin:auto;padding:20px;border-radius:10px;background-color:#f8f8f8;font-family:sans-serif;">
        <div style="text-align:center;">
          <h1 style="font-size:26px;color:#1a73e8;margin-bottom:10px;">🌐 Lumenza Media</h1>
          <h2 style="color:#333;">🔐 Admin Login OTP</h2>
          <p style="font-size:16px;color:#444;">Use the following OTP to login to the Admin Panel:</p>
          <div style="font-size:30px;font-weight:bold;margin:20px 0;color:#1a73e8;">${otp}</div>
          <p style="font-size:14px;color:#888;">This code will expire in 5 minutes.</p>
          <hr style="margin:30px 0;" />
          <p style="font-size:12px;color:#aaa;">If you didn't request this OTP, please ignore this email.</p>
          <p style="font-size:13px;color:#666;">— Lumenza Security Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Lumenza Admin" <${emailUser}>`,
      to: email,
      subject: "Your Admin Login OTP - Lumenza",
      html: htmlTemplate,
    });

    res.json({ message: "✅ OTP sent to your email" });
  });

  // ✅ Verify OTP
  app.post("/admin/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    const user = await collection.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const now = new Date();
    const diff = (now - new Date(user.createdAt)) / 1000 / 60;

    if (diff > 5) {
      return res.status(403).json({ message: "OTP expired" });
    }

    res.json({ message: "OTP verified successfully", token: "admin-token" });
  });
}

module.exports = adminAuthRoutes;
