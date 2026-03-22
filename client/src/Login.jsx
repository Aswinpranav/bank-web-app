import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import "./App.css";
import LiveTree from "./LiveTree";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  // Custom parallax inputs for the 3D Tree
  const floatY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const floatOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 0.5, 0]);
  const treeScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const treeY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://agrichain-backend-4xal.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          if (res.status === 502 || res.status === 503) {
            setError("⏳ Server is waking up (takes ~50s). Please wait and try again.");
            return;
          }
          throw new Error("Invalid server response");
        }
      } catch (err) {
        setError("❌ Server error: " + err.message);
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token || "dummy-auth-token");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      if (err.name === "TypeError") {
        setError("❌ Server unreachable. (Please hard-refresh the page)");
      } else {
        setError("❌ Error: " + err.message);
      }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.3 } }
  };

  return (
    <div className="login-page-wrapper" ref={containerRef}>
      {/* Parallax Background */}
      <motion.div className="parallax-bg-layer" style={{ y: yBg }} />

      {/* Hero / Login Section */}
      <div className="login-container">
        <motion.div
          className="parallax-floating-img"
          style={{ y: floatY, opacity: floatOpacity }}
        >
          {/* Subtle glowing element in the bg behind login */}
          <div className="floating-glow"></div>
        </motion.div>

        {/* Dynamic Canvas Live Wallpaper */}
        <LiveTree />

        <motion.div
          className="login-box"
          style={{ zIndex: 10 }}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <h2>Login</h2>

          {error && <motion.div className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0,255,153,0.4)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
            >
              Login
            </motion.button>
          </form>

          <p className="forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p className="footer">
            New user? <Link to="/register">Register</Link>
          </p>
        </motion.div>
      </div>

      {/* Scrollable Features Section to demonstrate the requested scroll animations */}
      <div className="login-scroll-features">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="feature-header"
        >
          <h3>Discover The Ecosystem</h3>
          <p>Scroll down to explore immersive transitions and a transparent supply chain.</p>
        </motion.div>

        <div className="feature-grid-3d">
          {["Farm", "Nodes", "Network", "Market"].map((title, i) => (
            <motion.div
              key={i}
              className="feature-sphere-wrapper"
              initial={{ opacity: 0, scale: 0.8, y: 80, rotateY: 45 }}
              whileInView={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.15, type: "spring", stiffness: 60 }}
            >
              <div className="sphere-inner">
                {/* Simulated 3D texture inside sphere */}
                <div className="sphere-texture"></div>
              </div>
              <h4>{title}</h4>
            </motion.div>
          ))}
        </div>

        <div className="feature-cards-section">
          {[
            { title: "Direct Connection", desc: "No unnecessary middlemen. Engage directly using our reliable ledger." },
            { title: "Secure P2P Ledger", desc: "Every transaction is securely stored with zero room for corruption." },
            { title: "Instant Settlements", desc: "Watch your balances update natively as you verify transitions in real time." }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="feature-text-card"
              initial={{ opacity: 0, x: i % 2 === 0 ? 100 : -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.02, borderColor: "rgba(0, 255, 153, 0.4)" }}
            >
              <div className="card-icon">⚡</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
