import express from "express";
import cors from "cors";

import registerRoutes from "./register.js";
import authRoutes from "./auth.js";
import verifyRoutes from "./verify.js";
import { db } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

app.get("/farmers/id/:farmer_id", (req, res) => {
  const { farmer_id } = req.params;
  db.query("SELECT * FROM farmers WHERE farmer_id = ?", [farmer_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching farmer details." });
    if (results.length === 0) return res.status(404).json({ message: "Farmer not found." });
    res.json(results[0]);
  });
});

app.get("/supply-chain/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM farmers WHERE farmer_id = ?", [id], (err, farmers) => {
    if (err) return res.status(500).json({ message: "Error fetching farmer." });
    if (farmers.length === 0) return res.status(404).json({ message: "No supply chain data found for this QR." });

    db.query("SELECT * FROM mediators WHERE farmer_id = ?", [id], (err, mediators) => {
      if (err) return res.status(500).json({ message: "Error fetching mediator." });
      res.json({
        farmer: farmers[0],
        mediator: mediators.length > 0 ? mediators[0] : null
      });
    });
  });
});

app.post("/mediators", (req, res) => {
  const { mediator_id, farmer_id, name, phone, location, selling_price, notes, qr_data } = req.body;

  db.query(
    "INSERT INTO mediators (mediator_id, farmer_id, name, phone, location, selling_price, notes, qr_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [mediator_id, farmer_id, name, phone, location, selling_price, notes || '', qr_data],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error saving mediator.", error: err.message });
      res.status(201).json({ message: "Mediator registered successfully." });
    }
  );
});

app.get("/mediators", (req, res) => {
  db.query("SELECT * FROM mediators ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error retrieving mediators." });
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

app.get("/transactions", (req, res) => {
  db.query("SELECT id, farmer_id as ref_id, name, crop as item, expected_price as price, area as location, created_at, 'Farmer Registration' as type FROM farmers", (err1, farmers) => {
    if (err1) return res.status(500).json({ message: "Error fetching farmers for transactions." });

    db.query("SELECT id, farmer_id as ref_id, name, 'N/A' as item, selling_price as price, location, created_at, 'Mediator Update' as type FROM mediators", (err2, mediators) => {
      if (err2) return res.status(500).json({ message: "Error fetching mediators for transactions." });

      const transactions = [...farmers, ...mediators].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(transactions);
    });
  });
});

app.get("/reports", (req, res) => {
  db.query("SELECT COUNT(*) as totalFarmers FROM farmers", (err1, fCount) => {
    if (err1) return res.status(500).json({ message: "Error fetching farmers count." });

    db.query("SELECT COUNT(*) as totalMediators FROM mediators", (err2, mCount) => {
      if (err2) return res.status(500).json({ message: "Error fetching mediators count." });

      db.query("SELECT crop, COUNT(*) as count, AVG(expected_price) as avg_price FROM farmers GROUP BY crop", (err3, crops) => {
        if (err3) return res.status(500).json({ message: "Error fetching crops data." });

        db.query("SELECT AVG(selling_price) as avg_selling_price FROM mediators", (err4, market) => {
          if (err4) return res.status(500).json({ message: "Error fetching market data." });

          res.json({
            totalFarmers: fCount[0]?.totalFarmers || 0,
            totalMediators: mCount[0]?.totalMediators || 0,
            crops: crops || [],
            avgMarketPrice: market[0]?.avg_selling_price || 0
          });
        });
      });
    });
  });
});

app.listen(5000, () => {

  console.log("✅ Server running on port 5000");
});
