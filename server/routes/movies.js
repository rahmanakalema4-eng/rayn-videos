const express = require('express');
const db = require('../db');
const { verifyToken, verifyVip, verifyAdmin } = require('../middleware/authMiddleware');
const { createMovieUrl } = require('../services/r2');

const router = express.Router();
const uploadedMovieKeyPattern = /^movies\/[0-9a-f-]{36}\.(mp4|webm|mov|m4v|mkv)$/i;

function parseMovieId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function getMovieFilename(title, id) {
  const safeTitle = title
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
  return `${safeTitle || `rayn-movie-${id}`}.mp4`;
}

router.get('/', async (req, res, next) => {
  const { tier = 'all' } = req.query;
  if (!['all', 'vip', 'free'].includes(tier)) {
    return res.status(400).json({ message: 'tier must be one of: all, vip, free' });
  }

  try {
    const filter = tier === 'all' ? '' : 'WHERE is_vip = $1';
    const params = tier === 'all' ? [] : [tier === 'vip'];
    const result = await db.query(
      `SELECT id, title, description, mood, duration, release_year, rating, thumbnail_url, is_vip, created_at
       FROM movies
       ${filter}
       ORDER BY created_at DESC, id DESC`,
      params,
    );

    return res.json({ movies: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', verifyToken, verifyAdmin, async (req, res, next) => {
  const {
    title,
    description = null,
    mood = null,
    duration = null,
    release_year = null,
    rating = null,
    is_vip = false,
    r2_key: r2Key,
  } = req.body || {};

  if (typeof title !== 'string' || !title.trim() || title.trim().length > 255) {
    return res.status(400).json({ message: 'A title of 1-255 characters is required' });
  }
  if (typeof is_vip !== 'boolean') {
    return res.status(400).json({ message: 'is_vip must be a boolean' });
  }
  if (typeof r2Key !== 'string' || !uploadedMovieKeyPattern.test(r2Key)) {
    return res.status(400).json({ message: 'A valid presigned movie upload key is required' });
  }
  if (release_year !== null && (!Number.isInteger(release_year) || release_year < 1888 || release_year > 9999)) {
    return res.status(400).json({ message: 'release_year must be a valid four-digit year' });
  }
  if (rating !== null && (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 0 || rating > 10)) {
    return res.status(400).json({ message: 'rating must be a number between 0 and 10' });
  }
  if (description !== null && (typeof description !== 'string' || description.length > 5000)) {
    return res.status(400).json({ message: 'description must be 5000 characters or fewer' });
  }
  if (mood !== null && (typeof mood !== 'string' || mood.length > 50)) {
    return res.status(400).json({ message: 'mood must be 50 characters or fewer' });
  }
  if (duration !== null && (typeof duration !== 'string' || duration.length > 50)) {
    return res.status(400).json({ message: 'duration must be 50 characters or fewer' });
  }

  try {
    const result = await db.query(
      `INSERT INTO movies
        (title, description, mood, duration, release_year, rating, is_vip, r2_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, mood, duration, release_year, rating, thumbnail_url, is_vip, created_at`,
      [title.trim(), description, mood, duration, release_year, rating, is_vip, r2Key],
    );
    return res.status(201).json({ movie: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/stream', verifyToken, async (req, res, next) => {
  const id = parseMovieId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid movie id' });

  try {
    const result = await db.query(
      'SELECT id, title, duration, is_vip, r2_key FROM movies WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const movie = result.rows[0];
    if (movie.is_vip && req.user.is_vip !== true) {
      return res.status(403).json({ message: 'Upgrade to VIP to stream this movie' });
    }
    if (!movie.r2_key) {
      return res.status(409).json({ message: 'Movie streaming is not configured' });
    }

    const url = await createMovieUrl(movie.r2_key);
    return res.json({
      movie: { id: movie.id, title: movie.title, duration: movie.duration },
      url,
      expiresIn: 3600,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/download', verifyToken, verifyVip, async (req, res, next) => {
  const id = parseMovieId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid movie id' });

  try {
    const result = await db.query(
      'SELECT id, title, r2_key FROM movies WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const movie = result.rows[0];
    if (!movie.r2_key) {
      return res.status(409).json({ message: 'Movie download is not configured' });
    }

    const url = await createMovieUrl(movie.r2_key, {
      download: true,
      filename: getMovieFilename(movie.title, movie.id),
    });
    return res.json({
      movie: { id: movie.id, title: movie.title },
      url,
      expiresIn: 3600,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
