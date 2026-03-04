import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {}; // Ensure state is not null

  const handleVerify = async () => {
    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, otp })
      });

      const data = await res.json();
      if (!res.ok) setError(data.message);
      else {
        localStorage.setItem("token", data.token || "temp-token"); // Store token if backend sends it
        navigate("/dashboard", { state: { email: state.email }, replace: true });
      }
    } catch (err) {
      setError("Server unreachable");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
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
        <h2>Verify OTP</h2>
        <p className="subtitle">Enter the code sent to {state.email}</p>

        {error && <motion.div className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

        <input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVerify}
        >
          Verify Account
        </motion.button>
      </motion.div>
    </div>
  );
}

export default VerifyOtp;
