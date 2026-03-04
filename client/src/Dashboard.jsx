import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Globe, ChevronRight,
  Sprout, Store, Users, BarChart3,
  ScanLine, History, FileText,
  LogOut, User, ShieldCheck, Mail, List, Trash2
} from "lucide-react";
import "./Dashboard.css";
// Remove static farmer image, using 3D Canvas instead
import LiveTree from "./LiveTree";

const translations = {
  en: {
    title: "AgriChain Transparency System",
    subtitle: "Connecting Farmers, Mediators and Clients using QR-based product traceability to ensure fair pricing and transparency.",
    farmer: "Farmer Registration",
    mediator: "Mediator Entry",
    client: "Client Transparency",
    farmerDesc: "Generate a QR for registered farmers to upload crop details and price.",
    mediatorDesc: "Mediators scan QR and record buying and selling price transparently.",
    clientDesc: "Clients scan QR to view full supply chain and contact farmers directly.",
    transparency: "Price Transparency",
    traceable: "Traceable Supply Chain",
    direct: "Direct Farmer Contact"
  },
  hi: {
    title: "एग्रीचेन पारदर्शिता प्रणाली",
    subtitle: "किसानों, मध्यस्थों और ग्राहकों को क्यूआर आधारित उत्पाद ट्रेसबिलिटी से जोड़ता है।",
    farmer: "किसान पंजीकरण",
    mediator: "मध्यस्थ प्रविष्टि",
    client: "ग्राहक पारदर्शिता",
    farmerDesc: "किसान अपनी फसल और मूल्य की जानकारी क्यूआर से जोड़ सकते हैं।",
    mediatorDesc: "मध्यस्थ खरीद और बिक्री मूल्य पारदर्शी रूप से दर्ज करते हैं।",
    clientDesc: "ग्राहक पूरी सप्लाई चेन देख सकते हैं और सीधे किसान से संपर्क कर सकते हैं।",
    transparency: "मूल्य पारदर्शिता",
    traceable: "ट्रेसेबल सप्लाई चेन",
    direct: "सीधा किसान संपर्क"
  },
  ta: {
    title: "அக்ரிசெயின் வெளிப்படைத் திட்டம்",
    subtitle: "QR அடிப்படையிலான கண்காணிப்பு மூலம் விவசாயிகள், நடுவண் வியாபாரிகள் மற்றும் வாடிக்கையாளர்களை இணைக்கிறது.",
    farmer: "விவசாயி பதிவு",
    mediator: "நடுவர் பதிவு",
    client: "வாடிக்கையாளர் பார்வை",
    farmerDesc: "விவசாயிகள் பயிர் விவரங்கள் மற்றும் விலையை QR மூலம் சேர்க்கலாம்.",
    mediatorDesc: "நடுவர் வாங்கும் மற்றும் விற்கும் விலைகளை பதிவு செய்கிறார்.",
    clientDesc: "வாடிக்கையாளர் முழு விநியோகச் சங்கிலியை பார்வையிடலாம்.",
    transparency: "விலை வெளிப்படைத் தன்மை",
    traceable: "கண்காணிக்க கூடிய சங்கிலி",
    direct: "நேரடி விவசாயி தொடர்பு"
  }
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [farmerData, setFarmerData] = useState({ name: "", phone: "", crop: "", area: "", expectedPrice: "", farmerImage: "", productImage: "", description: "" });
  const [farmerSuccess, setFarmerSuccess] = useState("");
  const [generatedQrValue, setGeneratedQrValue] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [pendingFarmerId, setPendingFarmerId] = useState("");
  const [pendingQrData, setPendingQrData] = useState("");
  const [showFarmersList, setShowFarmersList] = useState(false);
  const [farmersList, setFarmersList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("http://localhost:5000/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) setUser(data);
        else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setFarmerSuccess("");
    try {
      const res = await fetch("http://localhost:5000/farmers/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: farmerData.phone })
      });
      const data = await res.json();

      if (res.ok) {
        // Prepare data for next step
        const generateId = "AGF" + Math.floor(Math.random() * 90000) + 10000;
        const qrData = `AGRICHAIN FARMER DETAILS
------------------------
ID: ${generateId}
Name: ${farmerData.name}
Crop: ${farmerData.crop}
Location: ${farmerData.area}
Expected Price: Rs.${farmerData.expectedPrice}/kg`;

        setPendingFarmerId(generateId);
        setPendingQrData(qrData);
        setOtpStep(true);
        setFarmerSuccess(data.message);
      } else {
        setFarmerSuccess(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setFarmerSuccess("Failed to contact server.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFarmerSuccess("");
    try {
      const res = await fetch("http://localhost:5000/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: pendingFarmerId,
          name: farmerData.name,
          phone: farmerData.phone,
          crop: farmerData.crop,
          area: farmerData.area,
          expected_price: farmerData.expectedPrice,
          farmer_image: farmerData.farmerImage,
          product_image: farmerData.productImage,
          description: farmerData.description,
          qr_data: pendingQrData,
          otp_code: otpInput
        })
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedQrValue(pendingQrData); // Show QR
        setOtpStep(false);
        setOtpInput("");
        setFarmerSuccess(`Farmer successfully registered! ID: ${pendingFarmerId}. Unique QR Code has been generated.`);
      } else {
        setFarmerSuccess(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setFarmerSuccess("Failed to contact server.");
    }
  };

  const closeFarmerModal = () => {
    setShowFarmerModal(false);
    setGeneratedQrValue("");
    setFarmerSuccess("");
    setOtpStep(false);
    setOtpInput("");
    setFarmerData({ name: "", phone: "", crop: "", area: "", expectedPrice: "", farmerImage: "", productImage: "", description: "" });
  };

  const handleShowFarmersList = async () => {
    try {
      const res = await fetch("http://localhost:5000/farmers");
      const data = await res.json();
      if (Array.isArray(data)) setFarmersList(data);
      setShowFarmersList(true);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    }
  };

  const handleDeleteFarmer = async (farmerId) => {
    try {
      const res = await fetch(`http://localhost:5000/farmers/${farmerId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setFarmersList(prev => prev.filter(f => f.id !== farmerId));
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.message || res.statusText}`);
      }
    } catch (err) {
      alert(`Error deleting farmer: ${err.message}`);
    }
  };

  const t = translations[language];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };

  const cardHover = {
    y: -10,
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    boxShadow: "0px 15px 30px rgba(0, 255, 153, 0.2)",
    transition: { duration: 0.3 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateX: 90 },
    visible: { opacity: 1, scale: 1, rotateX: 0, transition: { type: "spring", duration: 0.5 } },
    exit: { opacity: 0, scale: 0.5, rotateX: -90, transition: { duration: 0.3 } }
  };

  return (
    <div className="dashboard-container">
      {/* 3D Moving Tree Wallpaper injected globally in Dashboard - Using unique hue for a different style */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <LiveTree hueRotate={-40} />
      </div>

      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
        className="navbar"
      >
        <div className="left-section">
          <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </div>
          <div className="nav-links">
            <button className="nav-btn">Home</button>
            <button className="nav-btn">About</button>
            <button className="nav-btn">Contact</button>
          </div>
        </div>

        <div className="language-wrapper">
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3>AgriChain Menu</h3>
        <button className="side-btn" onClick={() => { setShowFarmerModal(true); setGeneratedQrValue(""); setFarmerSuccess(""); }}><Sprout /> Register Farmer</button>
        <button className="side-btn" onClick={handleShowFarmersList}><List /> View Registered Farmers</button>
        <button className="side-btn"><ScanLine /> Scan QR</button>
        <button className="side-btn"><History /> Transaction History</button>
        <button className="side-btn"><FileText /> Reports</button>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
          <button className="side-btn" onClick={() => setShowProfile(true)}>
            <User /> My Profile
          </button>
          <button className="side-btn" onClick={handleLogout} style={{ color: "#ff5555", borderColor: "rgba(255,85,85,0.3)" }}>
            <LogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? "shift" : ""}`}>

        {/* Animated Hero Section */}
        <motion.div
          className="hero"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="hero-text" variants={itemVariants}>
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {t.title}
            </motion.h1>
            <motion.p variants={itemVariants}>
              {t.subtitle}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* 3D Flow Section */}
        <motion.div
          className="flow-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="flow-section-title">
            <motion.h2 variants={itemVariants}>The Transparent Flow</motion.h2>
            <motion.p variants={itemVariants}>From Farm to Table, Track Every Step</motion.p>
          </div>

          <div className="flow-grid">
            {/* Farmer Card */}
            <motion.div
              className="flow-card-container"
              variants={itemVariants}
              whileHover={cardHover}
            >
              <div className="flow-card">
                <div className="card-icon">
                  <Sprout size={32} />
                </div>
                <div className="card-content">
                  <h3>{t.farmer}</h3>
                  <p>{t.farmerDesc}</p>
                </div>
              </div>
            </motion.div>

            {/* Mediator Card */}
            <motion.div
              className="flow-card-container"
              variants={itemVariants}
              whileHover={cardHover}
            >
              <div className="flow-card">
                <div className="card-icon">
                  <Store size={32} />
                </div>
                <div className="card-content">
                  <h3>{t.mediator}</h3>
                  <p>{t.mediatorDesc}</p>
                </div>
              </div>
            </motion.div>

            {/* Client Card */}
            <motion.div
              className="flow-card-container"
              variants={itemVariants}
              whileHover={cardHover}
            >
              <div className="flow-card">
                <div className="card-icon">
                  <Users size={32} />
                </div>
                <div className="card-content">
                  <h3>{t.client}</h3>
                  <p>{t.clientDesc}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="transparency-stats"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="stat-box" variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <h2>100%</h2>
            <p>{t.transparency}</p>
          </motion.div>

          <motion.div className="stat-box" variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <h2>QR</h2>
            <p>{t.traceable}</p>
          </motion.div>

          <motion.div className="stat-box" variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <h2>Direct</h2>
            <p>{t.direct}</p>
          </motion.div>
        </motion.div>

      </div>

      {/* PROFILE MODAL */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              className="profile-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowProfile(false)}><X /></button>
              <div className="profile-header">
                <div className="profile-avatar"><User size={40} /></div>
                <h2>{user.name}</h2>
                <span className="badge">Verified Member</span>
              </div>

              <div className="profile-details">
                <div className="detail-row">
                  <Mail size={18} />
                  <span>{user.email}</span>
                </div>
                <div className="detail-row">
                  <ShieldCheck size={18} />
                  <span>Account Status: <b>Active</b></span>
                </div>
              </div>

              <button className="logout-btn-modal" onClick={handleLogout}>
                <LogOut size={18} /> Sign Out
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* FARMER REGISTRATION MODAL */}
        {showFarmerModal && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFarmerModal}
          >
            <motion.div
              className="profile-modal farmer-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={closeFarmerModal}><X /></button>
              <div className="profile-header" style={{ marginBottom: "15px" }}>
                <div className="profile-avatar"><Sprout size={40} /></div>
                <h2>Register Farmer</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Onboard farmers & generate QR</p>
              </div>

              {farmerSuccess && (
                <motion.div className="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {farmerSuccess}
                </motion.div>
              )}

              {generatedQrValue ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <div style={{ background: "white", padding: "16px", borderRadius: "8px", display: "inline-block" }}>
                    <QRCodeSVG value={generatedQrValue} size={220} level="M" includeMargin={true} />
                  </div>
                  <p style={{ marginTop: "15px", color: "var(--primary)" }}>Scan this QR for traceability!</p>
                  <button onClick={closeFarmerModal} className="submit-btn" style={{ marginTop: "20px", background: "rgba(255, 255, 255, 0.1)", color: "white" }}>
                    Done
                  </button>
                </div>
              ) : otpStep ? (
                <form onSubmit={handleVerifyOtp} className="farmer-form">
                  <p style={{ textAlign: "center", marginBottom: "15px", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    Enter the 6-digit OTP sent to <strong style={{ color: "white" }}>{farmerData.phone}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    required
                    maxLength="6"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    style={{ textAlign: "center", letterSpacing: "5px", fontSize: "1.2rem", fontWeight: "bold" }}
                  />
                  <button type="submit" className="submit-btn" style={{ marginTop: "15px" }}>
                    Verify & Register
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(false); setFarmerSuccess(""); setOtpInput(""); }}
                    style={{ background: "transparent", color: "var(--text-muted)", border: "none", width: "100%", marginTop: "10px", cursor: "pointer", fontSize: "0.9rem" }}
                  >
                    Go Back / Cancel
                  </button>
                </form>
              ) : (
                <form onSubmit={handleFarmerSubmit} className="farmer-form">
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={farmerData.name}
                      onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Contact Number"
                      required
                      value={farmerData.phone}
                      onChange={(e) => setFarmerData({ ...farmerData, phone: e.target.value })}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "5px" }}>Farmer Image (Upload)</label>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ padding: "8px", background: "rgba(0,0,0,0.3)" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFarmerData({ ...farmerData, farmerImage: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "5px" }}>Crop Image (Upload)</label>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ padding: "8px", background: "rgba(0,0,0,0.3)" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFarmerData({ ...farmerData, productImage: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Crop Name"
                      required
                      value={farmerData.crop}
                      onChange={(e) => setFarmerData({ ...farmerData, crop: e.target.value })}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Area/Location"
                        required
                        style={{ flex: 1 }}
                        value={farmerData.area}
                        onChange={(e) => setFarmerData({ ...farmerData, area: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Exp. Price /kg"
                        required
                        style={{ flex: 1 }}
                        value={farmerData.expectedPrice}
                        onChange={(e) => setFarmerData({ ...farmerData, expectedPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="description-box-wrapper" style={{ position: "relative", marginTop: "15px" }}>
                    <textarea
                      placeholder="Crop Description (e.g., Organic, Pesticide-free...)"
                      rows="3"
                      value={farmerData.description}
                      onChange={(e) => setFarmerData({ ...farmerData, description: e.target.value })}
                      style={{
                        width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(0,0,0,0.5)", color: "white", resize: "none", fontSize: "0.95rem"
                      }}
                    ></textarea>
                    <button
                      type="button"
                      className="ai-btn"
                      title="AI Auto-Generate Description"
                      onClick={() => {
                        const cropDesc = farmerData.crop ? farmerData.crop : "This crop";
                        setFarmerData({ ...farmerData, description: `High-quality, organically grown ${cropDesc}. Grown with minimal pesticides, ensuring premium health benefits. Ready for fresh market delivery.` });
                      }}
                      style={{
                        position: "absolute", bottom: "10px", right: "10px", left: "auto", width: "auto", whiteSpace: "nowrap",
                        background: "linear-gradient(45deg, #00ff99, #00ccff)",
                        border: "none", borderRadius: "5px", padding: "6px 12px", color: "#000", fontWeight: "bold",
                        cursor: "pointer", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "5px",
                        boxShadow: "0 0 10px rgba(0, 255, 153, 0.5)", transition: "all 0.3s ease", zIndex: 5
                      }}
                    >
                      ✨ AI Generate
                    </button>
                  </div>

                  <button type="submit" className="submit-btn" style={{ marginTop: "15px" }}>
                    Register & Generate QR
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* REGISTERED FARMERS LIST MODAL */}
        {showFarmersList && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFarmersList(false)}
          >
            <motion.div
              className="profile-modal"
              style={{ maxWidth: "550px", width: "100%", padding: "40px 20px" }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowFarmersList(false)}><X /></button>
              <div className="profile-header" style={{ marginBottom: "25px" }}>
                <div className="profile-avatar"><List size={40} /></div>
                <h2>Registered Farmers</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Scan their QR to view supply chain traceability!</p>
              </div>

              <div className="farmers-list">
                {farmersList.length > 0 ? (
                  farmersList.map((farmer, idx) => (
                    <motion.div
                      className="farmer-ticket"
                      key={farmer.id || idx}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="farmer-ticket-info" style={{ textAlign: "left", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <h4 style={{ margin: 0 }}>{farmer.name}</h4>
                          {user && user.email === "aswinpranav205@gmail.com" && (
                            <button
                              className="admin-delete-btn"
                              onClick={() => handleDeleteFarmer(farmer.id)}
                              title="Delete this farmer permanently"
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          )}
                        </div>
                        <p><span>ID:</span> {farmer.farmer_id}</p>
                        <p><span>Crop:</span> {farmer.crop}</p>
                        <p><span>Location:</span> {farmer.area}</p>
                        <p className="farmer-price">Price: ₹{farmer.expected_price}/kg</p>
                        {farmer.description && <p style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "5px", color: "#bbb" }}>"{farmer.description}"</p>}

                        {(farmer.farmer_image || farmer.product_image) && (
                          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            {farmer.farmer_image && (
                              <img src={farmer.farmer_image} alt="Farmer" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--primary)" }} />
                            )}
                            {farmer.product_image && (
                              <img src={farmer.product_image} alt="Product" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--primary)" }} />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="farmer-ticket-qr">
                        <QRCodeSVG value={farmer.qr_data} size={110} level="M" includeMargin={true} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="no-farmers" style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No farmers registered yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
