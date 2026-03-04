import express from "express";
import bcrypt from "bcrypt";
import { db } from "./db.js";
import { sendOtpMail } from "./mail.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).json({ message: "All fields required" });

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const hash = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  db.query("DELETE FROM otp_store WHERE email=?", [email]);
  db.query("INSERT INTO otp_store (email, otp) VALUES (?,?)", [email, otp]);

  db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hash],
    async err => {
      if (err)
        return res.status(409).json({ message: "Email already exists" });

      await sendOtpMail(email, otp);
      res.json({ message: "OTP sent to email" });
    }
  );
});

export default router;
