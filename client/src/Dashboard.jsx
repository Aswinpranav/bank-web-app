import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
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
    direct: "Direct Farmer Contact",
    menuTitle: "AgriChain Menu",
    menuRegFarmer: "Register Farmer",
    menuRegMediator: "Register Mediator",
    menuViewFarmers: "View Registered Farmers",
    menuScanQR: "Scan QR",
    menuHistory: "Transaction History",
    menuReports: "Reports",
    menuProfile: "My Profile",
    menuLogout: "Logout",
    modTitleFarmer: "Register Farmer",
    modDescFarmer: "Onboard farmers & generate QR",
    modTitleMediator: "Register Mediator",
    modDescMediator: "Update supply chain & generate new QR",
    modTitleScan: "Scan QR Code",
    modDescScan: "Hold the Farmer's QR Code inside the camera view",
    modTitleSupply: "Product Supply Chain",
    modDescSupply: "Traceability verified to the source",
    modTitleList: "Registered Farmers",
    modDescList: "Scan their QR to view supply chain traceability!"
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
    direct: "सीधा किसान संपर्क",
    menuTitle: "एग्रीचेन मेनू",
    menuRegFarmer: "किसान पंजीकृत करें",
    menuRegMediator: "मध्यस्थ पंजीकृत करें",
    menuViewFarmers: "पंजीकृत किसान देखें",
    menuScanQR: "क्यूआर स्कैन करें",
    menuHistory: "लेन-देन इतिहास",
    menuReports: "रिपोर्ट",
    menuProfile: "मेरी प्रोफ़ाइल",
    menuLogout: "लॉग आउट",
    modTitleFarmer: "किसान पंजीकरण",
    modDescFarmer: "किसानों को जोड़ें और क्यूआर बनाएं",
    modTitleMediator: "मध्यस्थ पंजीकरण",
    modDescMediator: "सप्लाई चेन अपडेट करें और नया क्यूआर बनाएं",
    modTitleScan: "क्यूआर (QR) स्कैन करें",
    modDescScan: "किसान का क्यूआर कोड कैमरे के सामने रखें",
    modTitleSupply: "उत्पाद की सप्लाई चेन",
    modDescSupply: "स्रोत तक सत्यापन ट्रैसेबिलिटी",
    modTitleList: "पंजीकृत किसान",
    modDescList: "सप्लाई चेन देखने के लिए उनका क्यूआर स्कैन करें!"
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
    direct: "நேரடி விவசாயி தொடர்பு",
    menuTitle: "அக்ரிசெயின் மெனு",
    menuRegFarmer: "விவசாயி பதிவு",
    menuRegMediator: "நடுவர் பதிவு",
    menuViewFarmers: "பதிவுசெய்த விவசாயிகளை காண்க",
    menuScanQR: "QR ஐ ஸ்கேன் செய்",
    menuHistory: "பரிவர்த்தனை வரலாறு",
    menuReports: "அறிக்கைகள்",
    menuProfile: "என் சுயவிவரம்",
    menuLogout: "வெளியேறு",
    modTitleFarmer: "விவசாயி பதிவு",
    modDescFarmer: "விவசாயிகளை சேர்த்து QR உருவாக்கவும்",
    modTitleMediator: "நடுவர் பதிவு",
    modDescMediator: "சங்கிலியைப் புதுப்பித்து புதிய QR உருவாக்கவும்",
    modTitleScan: "QR ஐ ஸ்கேன் செய்",
    modDescScan: "விவசாயியின் QR குறியீட்டை கேமராவில் காட்டவும்",
    modTitleSupply: "பொருள் விநியோகச் சங்கிலி",
    modDescSupply: "மூலத்திற்கு சுவடு சரிபார்க்கப்பட்டது",
    modTitleList: "பதிவு செய்யப்பட்ட விவசாயிகள்",
    modDescList: "சங்கிலியைப் பார்க்க அவர்களின் QR ஐ ஸ்கேன் செய்!"
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
  const [showMediatorModal, setShowMediatorModal] = useState(false);
  const [mediatorSuccess, setMediatorSuccess] = useState("");
  const [mediatorData, setMediatorData] = useState({ farmerId: "", name: "", phone: "", location: "", sellingPrice: "", notes: "" });
  const [fetchedFarmer, setFetchedFarmer] = useState(null);
  const [generatedMediatorQr, setGeneratedMediatorQr] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [supplyChainData, setSupplyChainData] = useState(null);
  const [showSupplyChainModal, setShowSupplyChainModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const navigate = useNavigate();

  const handleShowReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/reports");
      const data = await res.json();
      setReportsData(data);
      setShowReports(true);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleShowHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/transactions");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
      setShowHistory(true);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

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

  const handleFetchFarmer = async (e, idParam) => {
    if (e) e.preventDefault();
    const idToFetch = idParam || mediatorData.farmerId;
    if (!idToFetch) return;
    setMediatorSuccess("");
    setFetchedFarmer(null);
    try {
      const res = await fetch(`http://localhost:5000/farmers/id/${idToFetch}`);
      const data = await res.json();
      if (res.ok) {
        setFetchedFarmer(data);
        setMediatorSuccess(`Found farmer: ${data.name} for ${data.crop}`);
      } else {
        setMediatorSuccess(data.message || "Farmer not found.");
      }
    } catch (err) {
      setMediatorSuccess("Failed to contact server.");
    }
  };

  const handleViewSupplyChain = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/supply-chain/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSupplyChainData(data);
        setShowSupplyChainModal(true);
      } else {
        alert(data.message || "Failed to fetch supply chain.");
      }
    } catch (err) {
      alert("Failed to contact server.");
    }
  };

  useEffect(() => {
    if (showScanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render((decodedText) => {
        html5QrcodeScanner.clear().catch(console.error);
        setShowScanner(false);
        const match = decodedText.match(/(AGF\d+)/i);
        if (match) {
          const scannedId = match[1];
          handleViewSupplyChain(scannedId);
        } else {
          alert("Invalid QR Code. Could not find Farmer ID.");
        }
      }, (err) => {
        // Safe to ignore reading errors as it keeps scanning
      });

      return () => {
        html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [showScanner]);

  const handleMediatorSubmit = async (e) => {
    e.preventDefault();
    setMediatorSuccess("");
    try {
      const useSameId = fetchedFarmer.farmer_id;
      const qrData = `${fetchedFarmer.qr_data}\n\nMEDIATOR UPDATE\n------------------------\nMediator ID: ${useSameId}\nName: ${mediatorData.name}\nSelling Price: Rs.${mediatorData.sellingPrice}/kg\nLocation: ${mediatorData.location}`;

      const res = await fetch("http://localhost:5000/mediators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediator_id: useSameId,
          farmer_id: fetchedFarmer.farmer_id,
          name: mediatorData.name,
          phone: mediatorData.phone,
          location: mediatorData.location,
          selling_price: mediatorData.sellingPrice,
          notes: mediatorData.notes,
          qr_data: qrData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedMediatorQr(qrData);
        setMediatorSuccess(`Mediator successfully registered! Linked ID: ${useSameId}`);
      } else {
        setMediatorSuccess(data.message || "Failed to register mediator.");
      }
    } catch (err) {
      setMediatorSuccess("Failed to contact server.");
    }
  };

  const closeMediatorModal = () => {
    setShowMediatorModal(false);
    setGeneratedMediatorQr("");
    setMediatorSuccess("");
    setFetchedFarmer(null);
    setMediatorData({ farmerId: "", name: "", phone: "", location: "", sellingPrice: "", notes: "" });
  };

  const handleShowFarmersList = async () => {
    try {
      // Fetch both farmers and all mediators to merge
      const farmerRes = await fetch("http://localhost:5000/farmers");
      const farmerData = await farmerRes.json();

      const mediatorRes = await fetch("http://localhost:5000/mediators");
      const mediatorData = await mediatorRes.json();

      if (Array.isArray(farmerData)) {
        // Merge the mediator data into the farmer data array
        const updatedList = farmerData.map(farmer => {
          const foundMediator = mediatorData.find(m => m.farmer_id === farmer.farmer_id);
          if (foundMediator) {
            return {
              ...farmer,
              mediator: foundMediator,
              // Overwrite the qr_data so the latest one shows
              qr_data: foundMediator.qr_data
            };
          }
          return farmer;
        });
        setFarmersList(updatedList);
      }
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
        <h3>{t.menuTitle}</h3>
        <button className="side-btn" onClick={() => { setShowFarmerModal(true); setGeneratedQrValue(""); setFarmerSuccess(""); }}><Sprout /> {t.menuRegFarmer}</button>
        <button className="side-btn" onClick={() => { setShowMediatorModal(true); setMediatorSuccess(""); }}><Store /> {t.menuRegMediator}</button>
        <button className="side-btn" onClick={handleShowFarmersList}><List /> {t.menuViewFarmers}</button>
        <button className="side-btn" onClick={() => setShowScanner(true)}><ScanLine /> {t.menuScanQR}</button>
        <button className="side-btn" onClick={handleShowHistory}><History /> {t.menuHistory}</button>
        <button className="side-btn" onClick={handleShowReports}><FileText /> {t.menuReports}</button>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
          <button className="side-btn" onClick={() => setShowProfile(true)}>
            <User /> {t.menuProfile}
          </button>
          <button className="side-btn" onClick={handleLogout} style={{ color: "#ff5555", borderColor: "rgba(255,85,85,0.3)" }}>
            <LogOut /> {t.menuLogout}
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

      {/* SCANNER MODAL */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScanner(false)}
            style={{ zIndex: 1000 }}
          >
            <div
              className="profile-modal"
              style={{ width: "95%", maxWidth: "500px", padding: "20px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowScanner(false)}>
                <X />
              </button>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <ScanLine size={40} color="var(--primary)" />
                <h2>{t.modTitleScan}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "15px" }}>
                  {t.modDescScan}
                </p>
              </div>
              <div id="qr-reader" style={{ width: "100%", background: "#fff", borderRadius: "10px", overflow: "hidden" }}></div>
              <button className="submit-btn" style={{ marginTop: "20px", background: "#ff5555" }} onClick={() => setShowScanner(false)}>
                Cancel Scan
              </button>
            </div>
          </motion.div>
        )}

        {/* SUPPLY CHAIN VIEWER MODAL */}
        <AnimatePresence>
          {showSupplyChainModal && supplyChainData && (
            <motion.div
              className="profile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupplyChainModal(false)}
              style={{ zIndex: 900 }}
            >
              <motion.div
                className="profile-modal"
                style={{ maxWidth: "600px", width: "100%", padding: "30px 20px" }}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={e => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setShowSupplyChainModal(false)}><X /></button>
                <div className="profile-header" style={{ marginBottom: "20px" }}>
                  <div className="profile-avatar" style={{ background: "rgba(0,255,153,0.1)" }}><Globe size={40} color="var(--primary)" /></div>
                  <h2>{t.modTitleSupply}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.modDescSupply}</p>
                </div>

                <div style={{ position: "relative", paddingLeft: "20px", borderLeft: "2px solid rgba(0,255,153,0.3)", marginLeft: "10px", textAlign: "left" }}>
                  {/* Farmer Step */}
                  <div style={{ marginBottom: "30px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "-31px", top: "0px", background: "var(--background)", borderRadius: "50%", padding: "4px", border: "2px solid #00ff99" }}>
                      <Sprout size={16} color="#00ff99" />
                    </div>
                    <h3 style={{ color: "white", margin: "0 0 10px 0" }}>Farm Origin</h3>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px" }}>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Farmer:</strong> {supplyChainData.farmer?.name}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Location:</strong> {supplyChainData.farmer?.area}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Crop:</strong> {supplyChainData.farmer?.crop}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem", color: "#ff5555" }}><strong>Farm Expected Price:</strong> ₹{supplyChainData.farmer?.expected_price}/kg</p>
                      {supplyChainData.farmer?.description && (
                        <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "#bbb", marginTop: "10px" }}>"{supplyChainData.farmer.description}"</p>
                      )}
                    </div>
                  </div>

                  {/* Mediator Step */}
                  {supplyChainData.mediator ? (
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "-31px", top: "0px", background: "var(--background)", borderRadius: "50%", padding: "4px", border: "2px solid #00ccff" }}>
                        <Store size={16} color="#00ccff" />
                      </div>
                      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>Retail / Mediator</h3>
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px" }}>
                        <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Store/Mediator:</strong> {supplyChainData.mediator.name}</p>
                        <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Location:</strong> {supplyChainData.mediator.location}</p>
                        <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Contact:</strong> {supplyChainData.mediator.phone}</p>
                        <p style={{ margin: "5px 0", fontSize: "0.95rem", color: "#00ccff" }}><strong>Market Selling Price:</strong> ₹{supplyChainData.mediator.selling_price}/kg</p>
                        {supplyChainData.mediator.notes && (
                          <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "#bbb", marginTop: "10px" }}>"{supplyChainData.mediator.notes}"</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", opacity: 0.5 }}>
                      <div style={{ position: "absolute", left: "-31px", top: "0px", background: "var(--background)", borderRadius: "50%", padding: "4px", border: "2px solid #666" }}>
                        <Users size={16} color="#666" />
                      </div>
                      <p style={{ fontStyle: "italic" }}>Direct from Farmer. No mediators involved yet.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROFILE MODAL */}
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
                <h2>{t.modTitleFarmer}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.modDescFarmer}</p>
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

        {/* MEDIATOR REGISTRATION MODAL */}
        {showMediatorModal && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMediatorModal}
          >
            <motion.div
              className="profile-modal farmer-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={closeMediatorModal}><X /></button>
              <div className="profile-header" style={{ marginBottom: "15px" }}>
                <div className="profile-avatar"><Store size={40} /></div>
                <h2>{t.modTitleMediator}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.modDescMediator}</p>
              </div>

              {mediatorSuccess && (
                <motion.div className="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {mediatorSuccess}
                </motion.div>
              )}

              {generatedMediatorQr ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <div style={{ background: "white", padding: "16px", borderRadius: "8px", display: "inline-block" }}>
                    <QRCodeSVG value={generatedMediatorQr} size={220} level="M" includeMargin={true} />
                  </div>
                  <p style={{ marginTop: "15px", color: "var(--primary)" }}>Updated Traceability QR Code!</p>
                  <button onClick={closeMediatorModal} className="submit-btn" style={{ marginTop: "20px", background: "rgba(255, 255, 255, 0.1)", color: "white" }}>
                    Done
                  </button>
                </div>
              ) : !fetchedFarmer ? (
                <form onSubmit={handleFetchFarmer} className="farmer-form">
                  <p style={{ textAlign: "center", marginBottom: "15px", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    Enter the Farmer ID (e.g., AGF12345) to fetch details
                  </p>
                  <input
                    type="text"
                    placeholder="Enter Farmer ID"
                    required
                    value={mediatorData.farmerId}
                    onChange={(e) => setMediatorData({ ...mediatorData, farmerId: e.target.value })}
                    style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: "bold", textTransform: "uppercase" }}
                  />
                  <button type="submit" className="submit-btn" style={{ marginTop: "15px" }}>
                    Search Farmer
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMediatorSubmit} className="farmer-form">
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px", marginBottom: "15px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)" }}>Fetched Farmer Details</h4>
                    <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Name:</strong> {fetchedFarmer.name}</p>
                    <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Crop:</strong> {fetchedFarmer.crop}</p>
                    <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Expected Price:</strong> ₹{fetchedFarmer.expected_price}/kg</p>
                    <button type="button" onClick={() => { setFetchedFarmer(null); setMediatorSuccess(""); }} style={{ background: "none", color: "#ff5555", border: "none", padding: 0, marginTop: "10px", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                      Wrong Farmer? Go Back
                    </button>
                  </div>

                  <h4 style={{ margin: "10px 0", color: "white", textAlign: "left" }}>Mediator Details</h4>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Mediator Name"
                      required
                      value={mediatorData.name}
                      onChange={(e) => setMediatorData({ ...mediatorData, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Contact Number"
                      required
                      value={mediatorData.phone}
                      onChange={(e) => setMediatorData({ ...mediatorData, phone: e.target.value })}
                    />
                    <div style={{ display: "flex", gap: "10px", gridColumn: "1 / -1" }}>
                      <input
                        type="text"
                        placeholder="Location / Warehouse"
                        required
                        style={{ flex: 1 }}
                        value={mediatorData.location}
                        onChange={(e) => setMediatorData({ ...mediatorData, location: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Selling Price /kg"
                        required
                        style={{ flex: 1 }}
                        value={mediatorData.sellingPrice}
                        onChange={(e) => setMediatorData({ ...mediatorData, sellingPrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Additional Notes (Optional)"
                    rows="2"
                    value={mediatorData.notes}
                    onChange={(e) => setMediatorData({ ...mediatorData, notes: e.target.value })}
                    style={{
                      width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(0,0,0,0.5)", color: "white", resize: "none", fontSize: "0.95rem", marginTop: "10px"
                    }}
                  ></textarea>
                  <button type="submit" className="submit-btn" style={{ marginTop: "15px" }}>
                    Register & Update Supply Chain QR
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
                <h2>{t.modTitleList}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.modDescList}</p>
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

                        {farmer.mediator && (
                          <div style={{ marginTop: "15px", padding: "10px", background: "rgba(0, 204, 255, 0.1)", borderLeft: "3px solid #00ccff", borderRadius: "0 8px 8px 0" }}>
                            <h5 style={{ margin: "0 0 5px 0", color: "#00ccff", display: "flex", alignItems: "center", gap: "5px" }}>
                              <Store size={14} /> Mediator Linked
                            </h5>
                            <p style={{ margin: "3px 0", fontSize: "0.85rem" }}><span>Name:</span> {farmer.mediator.name}</p>
                            <p style={{ margin: "3px 0", fontSize: "0.85rem", color: "#00ccff" }}><span>Market Price:</span> ₹{farmer.mediator.selling_price}/kg</p>
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

      {/* TRANSACTION HISTORY MODAL */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              className="profile-modal"
              style={{ maxWidth: "650px", width: "100%", padding: "40px 20px", display: "flex", flexDirection: "column", maxHeight: "90vh" }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowHistory(false)}><X /></button>
              <div className="profile-header" style={{ marginBottom: "25px", flexShrink: 0 }}>
                <div className="profile-avatar"><History size={40} /></div>
                <h2>Transaction History</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Track all supply chain updates and registrations</p>
              </div>

              <div className="transactions-list-container" style={{ overflowY: "auto", paddingRight: "10px", flexGrow: 1 }}>
                {transactions.length > 0 ? (
                  transactions.map((tx, idx) => (
                    <motion.div
                      key={idx}
                      className="transaction-ticket"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        background: "rgba(0,0,0,0.4)", padding: "15px", borderRadius: "10px",
                        marginBottom: "15px", borderLeft: tx.type === "Farmer Registration" ? "4px solid #00ff99" : "4px solid #00ccff",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, color: tx.type === "Farmer Registration" ? "#00ff99" : "#00ccff" }}>{tx.type}</h4>
                        <span style={{ fontSize: "0.8rem", color: "#bbb" }}>{new Date(tx.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Farmer ID / Ref:</strong> {tx.ref_id}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.95rem" }}><strong>Name:</strong> {tx.name}</p>
                      {tx.type === "Farmer Registration" ? (
                        <>
                          <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Item:</strong> {tx.item}</p>
                          <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Location:</strong> {tx.location}</p>
                          <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#ff5555" }}><strong>Expected Price:</strong> ₹{tx.price}/kg</p>
                        </>
                      ) : (
                        <>
                          <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Location:</strong> {tx.location}</p>
                          <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#00ccff" }}><strong>Market Price:</strong> ₹{tx.price}/kg</p>
                        </>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No transactions found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPORTS MODAL */}
      <AnimatePresence>
        {showReports && reportsData && (
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReports(false)}
          >
            <motion.div
              className="profile-modal"
              style={{ maxWidth: "600px", width: "100%", padding: "40px 20px", display: "flex", flexDirection: "column" }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowReports(false)}><X /></button>
              <div className="profile-header" style={{ marginBottom: "25px" }}>
                <div className="profile-avatar" style={{ background: "rgba(255,165,0,0.1)" }}><BarChart3 size={40} color="#ffa500" /></div>
                <h2>System Reports</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Analytics and platform statistics</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "rgba(0,255,153,0.1)", border: "1px solid #00ff99", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 5px 0", color: "#00ff99", fontSize: "2rem" }}>{reportsData.totalFarmers}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "white" }}>Total Farmers</p>
                </div>
                <div style={{ background: "rgba(0,204,255,0.1)", border: "1px solid #00ccff", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 5px 0", color: "#00ccff", fontSize: "2rem" }}>{reportsData.totalMediators}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "white" }}>Total Mediators</p>
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "8px", textAlign: "left" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)" }}>Crop Insights vs Market</h4>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ color: "#bbb", fontSize: "0.9rem" }}>Average Market Selling Price:</span>
                  <strong style={{ color: "#00ccff" }}>₹{Number(reportsData.avgMarketPrice).toFixed(2)}/kg</strong>
                </div>

                <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "5px" }}>
                  {reportsData.crops && reportsData.crops.length > 0 ? (
                    reportsData.crops.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px" }}>
                        <div>
                          <strong style={{ color: "white", display: "block" }}>{c.crop}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#bbb" }}>Count: {c.count}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.85rem", color: "#bbb", display: "block" }}>Expected Price</span>
                          <strong style={{ color: "#00ff99" }}>₹{Number(c.avg_price).toFixed(2)}/kg</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>No crop data available yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
