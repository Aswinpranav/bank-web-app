import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { sendOtpMail } from "./mail.js";

const router = express.Router();
const SECRET_KEY = "super_secret_agri_key"; // In production use .env

/* ===== MIDDLEWARE: VERIFY TOKEN ===== */
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
};

/* ===== LOGIN ===== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "Invalid password" });

    // Generate Token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "24h" });

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email }
    });
  });
});

/* ===== GET PROFILE (ME) ===== */
router.get("/me", verifyToken, (req, res) => {
  db.query("SELECT id, name, email, is_verified FROM users WHERE id=?", [req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(result[0]);
  });
});

/* ===== FORGOT PASSWORD ===== */
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (result.length === 0)
      return res.status(404).json({ message: "Email not registered" });

    db.query("DELETE FROM otp_store WHERE email=?", [email]);
    db.query("INSERT INTO otp_store (email, otp) VALUES (?,?)", [email, otp]);

    await sendOtpMail(email, otp);
    res.json({ message: "OTP sent successfully" });
  });
});

/* ===== VERIFY OTP (Password Reset) ===== */
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp_store WHERE email=? AND otp=?",
    [email, otp],
    (err, result) => {
      if (result.length === 0)
        return res.status(400).json({ message: "Invalid OTP" });

      res.json({ message: "OTP verified" });
    }
  );
});

/* ===== RESET PASSWORD ===== */
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const hash = await bcrypt.hash(newPassword, 10);

  db.query("UPDATE users SET password=? WHERE email=?", [hash, email], () => {
    db.query("DELETE FROM otp_store WHERE email=?", [email]);
    res.json({ message: "Password updated successfully" });
  });
});

export default router;
