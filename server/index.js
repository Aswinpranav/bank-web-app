import express from "express";
import cors from "cors";

import registerRoutes from "./register.js";
import authRoutes from "./auth.js";
import verifyRoutes from "./verify.js";
import { db } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", registerRoutes);
app.use("/", authRoutes);
app.use("/", verifyRoutes);

// Farmers API
app.post("/farmers/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  // CHECK FOR DUPLICATE PHONE NUMBER BEFORE SENDING OTP
  db.query("SELECT id FROM farmers WHERE phone = ?", [phone], (err, results) => {
    if (err) return res.status(500).json({ message: "Database check failed." });
    if (results.length > 0) return res.status(400).json({ message: "Duplicate found! A farmer with this number is already registered." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    db.query("INSERT INTO otp_store (email, otp) VALUES (?, ?)", [phone, otp], (err2) => {
      if (err2) return res.status(500).json({ message: "Error generating OTP" });
      setTimeout(() => {
        console.log(`\n================================`);
        console.log(`📲 SIMULATED SMS TO ${phone}`);
        console.log(`Your AgriChain Farmer Verification OTP is: ${otp}`);
        console.log(`================================\n`);
      }, 500);
      res.json({ message: "OTP sent successfully. Check your server terminal/console for the OTP code." });
    });
  });
});

app.post("/farmers", (req, res) => {
  const { farmer_id, name, phone, crop, area, expected_price, farmer_image, product_image, description, qr_data, otp_code } = req.body;

  if (!otp_code) return res.status(400).json({ message: "OTP is required" });

  db.query(
    "SELECT * FROM otp_store WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1",
    [phone, otp_code],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error verifying OTP" });
      if (results.length === 0) return res.status(400).json({ message: "Invalid or expired OTP" });

      db.query(
        "INSERT INTO farmers (farmer_id, name, phone, crop, area, expected_price, farmer_image, product_image, description, qr_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [farmer_id, name, phone, crop, area, expected_price, farmer_image || null, product_image || null, description || '', qr_data],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "Error saving farmer to DB.", error: err2.message });

          db.query("DELETE FROM otp_store WHERE email = ?", [phone]);
          res.status(201).json({ message: "Farmer registered successfully." });
        }
      );
    }
  );
});

app.get("/farmers", (req, res) => {
  db.query("SELECT * FROM farmers ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error retrieving farmers." });
    res.json(results);
  });
});

app.delete("/farmers/:id", (req, res) => {
  const farmerId = req.params.id;
  db.query("DELETE FROM farmers WHERE id = ?", [farmerId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting farmer." });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Farmer not found." });
    res.json({ message: "Farmer deleted successfully." });
  });
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
