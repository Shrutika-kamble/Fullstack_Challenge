const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

function validatePassword(p) {
  if (typeof p !== 'string') return false;
  if (p.length < 8 || p.length > 16) return false;
  if (!/[A-Z]/.test(p)) return false;
  if (!/[^A-Za-z0-9]/.test(p)) return false;
  return true;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    if (!name || name.length < 20 || name.length > 60) return res.status(400).json({ error: 'Name must be 20-60 characters.'});
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email.'});
    if (address && address.length > 400) return res.status(400).json({ error: 'Address too long.'});
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be 8-16 chars, include an uppercase and a special char.'});
    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ error: 'Email already registered.'});
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, address, password: hash, role: 'user' });
    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role, name: user.name });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
