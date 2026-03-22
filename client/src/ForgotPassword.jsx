import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://agrichain-backend-4xal.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setMsg(data.message);

      if (res.ok) {
        setTimeout(() => navigate("/verify-otp", { state: { email } }), 1500);
      }
    } catch (err) {
      setMsg("Server unreachable");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-box"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <form onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <p className="subtitle">We'll send an OTP to your email.</p>

          {msg && <motion.div className={msg.includes("sent") ? "success" : "error"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{msg}</motion.div>}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Send OTP
          </motion.button>

          <p className="footer">
            <span role="button" style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate(-1)}>Back</span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
