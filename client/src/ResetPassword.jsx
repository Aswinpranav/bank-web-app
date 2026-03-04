import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleReset = async () => {
    if (password !== confirm)
      return setError("Passwords do not match");

    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state?.email, newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) setError(data.message);
      else {
        alert("Password changed successfully");
        navigate("/login");
      }
    } catch {
      setError("Server unreachable");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
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
        <h2>Reset Password</h2>
        <p className="subtitle">Create a new secure password</p>

        {error && <motion.div className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

        <input
          type="password"
          placeholder="New password"
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          onChange={e => setConfirm(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
        >
          Update Password
        </motion.button>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
