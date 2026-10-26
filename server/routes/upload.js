const express = require('express');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { createMovieUploadUrl } = require('../services/r2');

const router = express.Router();
const allowedExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v', '.mkv']);

router.post('/presign', verifyToken, verifyAdmin, async (req, res, next) => {
  const { filename, contentType } = req.body || {};
  if (typeof filename !== 'string' || filename.length > 255) {
    return res.status(400).json({ message: 'A valid video filename is required' });
  }
  if (typeof contentType !== 'string' || !contentType.startsWith('video/')) {
    return res.status(400).json({ message: 'A valid video content type is required' });
  }

  const extension = path.extname(filename).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return res.status(400).json({ message: 'Supported formats are MP4, WebM, MOV, M4V, and MKV' });
  }

  const key = `movies/${randomUUID()}${extension}`;
  try {
    const uploadUrl = await createMovieUploadUrl(key, contentType);
    return res.json({ uploadUrl, key, contentType, expiresIn: 900 });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
