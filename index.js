const express = require("express");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const { google } = require("googleapis");
const admin = require("firebase-admin");
require("dotenv").config();

const path = require('path');
const serviceAccount = require(path.join('F:', 'Microsoft Visual Studio', 'pkkdesasidomulyo-firebase-adminsdk-fbsvc-92f7108cef.json'));
// Inisialisasi Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccount)),
});

const GOOGLE_APPLICATION_CREDENTIALS = require('./service-account.json');

const app = express();
app.use(cors(
    origin = '*', // sesuaikan dengan origin dari frontend
    optionsSuccessStatus = 200
));
app.use(express.json());

// Konfigurasi Multer untuk menerima file
const upload = multer({ dest: "uploads/" });

// Inisialisasi Google Drive API
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

// Middleware untuk verifikasi Firebase Token
async function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) return res.status(401).json({ error: "Token tidak ditemukan" });

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({ error: "Token tidak valid" });
    }
}

// Upload file ke Google Drive
app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
    try {
        const fileMetadata = {
            name: req.file.originalname,
            parents: [PKKSIDOMULYO], // Opsional: simpan ke folder tertentu
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        });

        fs.unlinkSync(req.file.path); // Hapus file lokal setelah upload

        res.json({ success: true, fileId: file.data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
