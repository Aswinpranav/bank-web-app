import express from "express";
import { db } from "./db.js";

const router = express.Router();

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp_store WHERE email=? AND otp=?",
    [email, otp],
    (err, result) => {
      if (result.length === 0)
        return res.status(400).json({ message: "Invalid OTP" });

      db.query("UPDATE users SET is_verified=1 WHERE email=?", [email]);
      db.query("DELETE FROM otp_store WHERE email=?", [email]);

      res.json({ message: "Email verified successfully" });
    }
  );
});

export default router;
