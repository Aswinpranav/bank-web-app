import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Varsha#05",
  database: "auth_db",
  multipleStatements: true
});

db.connect(err => {
  if (err) console.error("❌ DB Error:", err);
  else console.log("✅ MySQL Connected");
});

db.query(`
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  is_verified TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS otp_store (
  email VARCHAR(100),
  otp VARCHAR(6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id VARCHAR(50),
  name VARCHAR(100),
  phone VARCHAR(20),
  crop VARCHAR(100),
  area VARCHAR(200),
  expected_price DECIMAL(10,2),
  farmer_image VARCHAR(500),
  product_image VARCHAR(500),
  description TEXT,
  qr_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
