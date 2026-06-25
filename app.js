const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// KONEKSI DATABASE
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "plekyy_db"
});

db.connect((err) => {
  if (err) { console.log("Database gagal terhubung!"); return; }
  console.log("Database berhasil terhubung!");
});

// ==================== ROUTE HALAMAN (CUSTOMER) ====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "menu.html"));
});

// ==================== ROUTE HALAMAN (PENJUAL) ====================
// Halaman Login Penjual
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Halaman Dashboard / Riwayat Penjual
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "riwayat.html"));
});


// ==================== API ROUTES (DATA) ====================

// 1. API Kirim Pesanan (Sekarang Menerima Nama & HP Asli dari Form)
app.post("/api/pesanan", (req, res) => {
  const { nama, no_hp, total, metode, alamat, detail_menu } = req.body; 
  
  const statusPesanan = (metode === 'cash') ? 'Selesai (Bayar di Toko)' : 'Proses (QRIS)';
  const infoPesanan = `Menu: ${detail_menu} | ${alamat}`;

  const sql = `
    INSERT INTO pesanan (nama, no_hp, pesanan, total, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Memasukkan variabel nama dan no_hp asli dari customer
  db.query(sql, [nama, no_hp, infoPesanan, total, statusPesanan], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Gagal menyimpan pesanan" });
    }
    res.json({ success: true, message: "Pesanan berhasil dikirim ke Penjual! 🎉" });
  });
});

// 2. API Mengambil Data untuk Dashboard Penjual
app.get("/api/riwayat", (req, res) => {
  const sql = "SELECT * FROM pesanan ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) { return res.status(500).json({ success: false }); }
    res.json(results);
  });
});

// 3. API Proses Login Penjual
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Akun penjual rahasia
  if (username === "admin_plekyy" && password === "pedas123") {
    return res.json({ success: true, message: "Login Berhasil!" });
  } else {
    return res.json({ success: false, message: "Username atau Password salah!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));