const { google } = require('googleapis');
const multer = require('multer');
const initMiddleware = require('./init-middleware.js');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Initialize multer middleware
const multerMiddleware = initMiddleware(
  upload.single('file')
);

// Google Drive API configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Process the file upload
    await multerMiddleware(req, res);

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const title = req.body.title || originalname;

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: Buffer.from(buffer),
      },
    });

    // Set file permissions to public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the public URL
    const fileData = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    res.status(200).json({
      success: true,
      fileId: response.data.id,
      fileUrl: fileData.data.webViewLink,
      downloadUrl: fileData.data.webContentLink
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
}