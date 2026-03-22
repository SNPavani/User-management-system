const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
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
const upload = multer({ storage });

function validatePasswordStrength(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

router.post('/signup', upload.single('image'), async (req, res) => {
  const name     = (req.body.name     || '').trim();
  const username = (req.body.username || '').trim();
  const email    = (req.body.email    || '').trim();
  const phone    = (req.body.phone    || '').trim();
  const password = req.body.password  || '';

  if (!name)     return res.status(400).json({ message: 'Name is required' });
  if (!username) return res.status(400).json({ message: 'Username is required' });
  if (!email)    return res.status(400).json({ message: 'Email is required' });
  if (!phone)    return res.status(400).json({ message: 'Phone is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });
  if (!req.file) return res.status(400).json({ message: 'Profile image is required' });

  if (!validatePasswordStrength(password)) {
    return res.status(400).json({ message: 'Password must be 8+ chars and include upper, lower, number, special char.' });
  }

  try {
    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM users WHERE phone = ? OR email = ? OR username = ? LIMIT 1',
        [phone, email, username],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });
    if (existing.length) {
      return res.status(409).json({ message: 'Phone, email, or username already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, username, email, phone, password, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, email, phone, hashedPassword, req.file.filename],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true, message: 'User registered successfully!' });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const identifier = (req.body.username || req.body.email || req.body.phone || '').trim();
  const password   = (req.body.password || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email/phone and password are required' });
  }

  db.query(
    'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?',
    [identifier, identifier, identifier],
    async (err, results) => {
      if (err)                         return res.status(500).json({ message: err.message });
      if (!results || !results.length) return res.status(401).json({ message: 'User not found' });

      const user    = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const { password: _pw, ...safeUser } = user;
      const base    = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      safeUser.imageUrl = user.image ? `${base}/uploads/${user.image}` : null;

      res.json({ token, user: safeUser });
    }
  );
});

router.put('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) return res.status(400).json({ message: 'Current password is required.' });
  if (!newPassword)     return res.status(400).json({ message: 'New password is required.' });

  if (!validatePasswordStrength(newPassword)) {
    return res.status(400).json({ message: 'New password must be 8+ chars with upper, lower, number, and special character.' });
  }

  try {
    const rows = await new Promise((resolve, reject) => {
      db.query('SELECT password FROM users WHERE id = ? LIMIT 1', [req.user.id], (err, results) =>
        err ? reject(err) : resolve(results)
      );
    });

    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const isCurrentCorrect = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isCurrentCorrect) return res.status(401).json({ message: 'Current password is incorrect.' });

    const isSameAsOld = await bcrypt.compare(newPassword, rows[0].password);
    if (isSameAsOld) return res.status(400).json({ message: 'New password must be different from your current password.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Password changed successfully.' });
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;