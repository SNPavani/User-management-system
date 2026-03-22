const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcryptjs');
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const db          = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(allowed ? null : new Error('Invalid file type'), allowed);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

function getBaseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

router.get('/', verifyToken, requireRole(['admin', 'lead', 'support']), (req, res) => {
  const page        = parseInt(req.query.page) || 1;
  const limit       = req.query.search ? 100 : (parseInt(req.query.limit) || 10);
  const offset      = (page - 1) * limit;
  const search      = req.query.search || '';
  const searchQuery = `%${search}%`;

  db.query(
    'SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR username LIKE ?',
    [searchQuery, searchQuery],
    (err, countResult) => {
      if (err) return res.status(500).json({ message: err.message });
      const total = countResult[0].total;

      db.query(
        'SELECT id, name, username, role, email, phone, image FROM users WHERE name LIKE ? OR username LIKE ? LIMIT ? OFFSET ?',
        [searchQuery, searchQuery, limit, offset],
        (err, results) => {
          if (err) return res.status(500).json({ message: err.message });
          const base           = getBaseUrl(req);
          const usersWithImage = results.map((u) => ({
            ...u,
            imageUrl: u.image ? `${base}/uploads/${u.image}` : null,
          }));
          res.json({ users: usersWithImage, total, page, limit });
        }
      );
    }
  );
});

router.get('/:id', verifyToken, requireRole(['admin', 'lead', 'support']), (req, res) => {
  db.query(
    'SELECT id, name, username, role, email, phone, image FROM users WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err)             return res.status(500).json({ message: err.message });
      if (!results.length) return res.status(404).json({ message: 'User not found' });
      const user    = results[0];
      const base    = getBaseUrl(req);
      user.imageUrl = user.image ? `${base}/uploads/${user.image}` : null;
      res.json(user);
    }
  );
});

router.post('/', verifyToken, requireRole(['admin', 'lead']), (req, res) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ message: uploadErr.message || 'Image upload failed' });

    const { name, username, password, role, email, phone } = req.body;
    const uname = (username || '').trim();

    if (!uname) return res.status(400).json({ message: 'Username is required.' });
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign admin role' });
    }

    try {
      const dupe = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM users WHERE username = ? LIMIT 1', [uname], (err, rows) =>
          err ? reject(err) : resolve(rows)
        );
      });
      if (dupe.length) return res.status(409).json({ message: 'Username already taken.' });

      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      const imageFilename  = req.file ? req.file.filename : null;

      db.query(
        'INSERT INTO users (name, username, password, role, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, uname, hashedPassword, role || 'user', email || '', phone || '', imageFilename],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'User created successfully' });
        }
      );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

router.put('/:id', verifyToken, requireRole(['admin', 'lead']), (req, res) => {
  upload.single('image')(req, res, (uploadErr) => {
    if (uploadErr) return res.status(400).json({ message: uploadErr.message || 'Image upload failed' });

    const { name, username, role, email, phone } = req.body;
    const trimmedUsername = (username || '').trim();

    if (!trimmedUsername) return res.status(400).json({ message: 'Username is required.' });
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign admin role' });
    }

    db.query(
      'SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1',
      [trimmedUsername, req.params.id],
      (err, rows) => {
        if (err)         return res.status(500).json({ message: err.message });
        if (rows.length) return res.status(409).json({ message: 'Username already taken.' });

        const imageFilename = req.file ? req.file.filename : null;

        if (imageFilename) {
          db.query(
            'UPDATE users SET name = ?, username = ?, role = ?, email = ?, phone = ?, image = ? WHERE id = ?',
            [name, trimmedUsername, role, email || '', phone || '', imageFilename, req.params.id],
            (err) => {
              if (err) return res.status(500).json({ message: err.message });
              res.json({ message: 'User updated successfully' });
            }
          );
        } else {
          db.query(
            'UPDATE users SET name = ?, username = ?, role = ?, email = ?, phone = ? WHERE id = ?',
            [name, trimmedUsername, role, email || '', phone || '', req.params.id],
            (err) => {
              if (err) return res.status(500).json({ message: err.message });
              res.json({ message: 'User updated successfully' });
            }
          );
        }
      }
    );
  });
});

router.delete('/:id', verifyToken, requireRole(['admin', 'lead']), (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

router.post('/:id/reset-password', verifyToken, requireRole(['admin', 'lead']), async (req, res) => {
  const userId = req.params.id;
  try {
    const target = await new Promise((resolve, reject) => {
      db.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [userId], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
    if (!target.length) return res.status(404).json({ message: 'User not found' });
    if (req.user.role === 'lead' && target[0].role === 'admin') {
      return res.status(403).json({ message: 'Lead cannot reset admin password' });
    }

    const tempPassword = Math.random().toString(36).slice(-10);
    const hashed       = await bcrypt.hash(tempPassword, 10);

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], (err) =>
        err ? reject(err) : resolve()
      );
    });
    res.json({ message: 'Temporary password generated.', tempPassword });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.patch('/me/avatar', verifyToken, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err)       return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'Avatar image is required.' });

    db.query('UPDATE users SET image = ? WHERE id = ?', [req.file.filename, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      const base     = getBaseUrl(req);
      const imageUrl = `${base}/uploads/${req.file.filename}`;
      res.json({ message: 'Avatar updated successfully', imageUrl, image: req.file.filename });
    });
  });
});

module.exports = router;