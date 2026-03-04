import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) setError(data.message);
      else navigate("/verify-otp", { state: { email } });

    } catch {
      setError("Server not reachable");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.9, rotateY: 90 },
    animate: { opacity: 1, scale: 1, rotateY: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, rotateY: -90, transition: { duration: 0.3 } }
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
        <h2>Register</h2>
        {error && <motion.div className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

        <form onSubmit={handleRegister}>
          <input placeholder="Name" onChange={e => setName(e.target.value)} required />
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} required />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Register
          </motion.button>
        </form>

        <p className="footer">
          Already registered? <Link to="/">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
