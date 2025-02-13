import { google } from 'googleapis';
import multer from 'multer';
import initMiddleware from '../init-middleware.js';
import { Readable } from 'stream';

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
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

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
  console.log('Received upload request');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
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
    console.log('Processing file upload');
    await multerMiddleware(req, res);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname);

    const { originalname, buffer, mimetype } = req.file;
    const title = req.body.title || originalname;

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Upload to Google Drive
    console.log('Uploading to Google Drive');
    const response = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: stream,
      },
    });

    console.log('File uploaded to Drive, setting permissions');

    // Set file permissions to public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('Getting file data');

    // Get the public URL
    const fileData = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    console.log('Upload successful');

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
      error: error.message || 'Failed to upload file'
    });
  }
}