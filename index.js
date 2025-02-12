const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('./service-account.json');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = new Storage({
  credentials: serviceAccount
});

const drive = google.drive({
  version: 'v3',
  auth: new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  })
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: ['PKKSIDOMULYO']
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    res.send({ success: true, fileId: response.data.id, fileUrl: `https://drive.google.com/file/d/${response.data.id}/view` });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});