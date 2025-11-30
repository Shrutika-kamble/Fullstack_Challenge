const express = require('express');
const router = express.Router();
const { User, Store, Rating } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole('admin'));

// Create new user (admin can add users and admins and store owners)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    // minimal validation, in real use reuse same validations as signup
    const bcrypt = require('bcrypt');
    const validator = require('validator');
    if (!name || name.length < 20 || name.length > 60) return res.status(400).json({ error: 'Name must be 20-60 characters.'});
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email.'});
    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hash, address, role: role || 'user' });
    res.json({ id: newUser.id, email: newUser.email });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create store
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    res.json(store);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List users with filtering & sorting
router.get('/users', async (req, res) => {
  try {
    const { q, role, sortBy='name', dir='ASC', page=1, pageSize=50 } = req.query;
    const where = {};
    if (role) where.role = role;
    const { Op } = require('sequelize');
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } },
      ];
    }
    const users = await User.findAll({ where, order: [[sortBy, dir]] });
    res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, address: u.address, role: u.role })));
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List stores with filters
router.get('/stores', async (req, res) => {
  try {
    const { q, sortBy='name', dir='ASC' } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (q) where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } },
    ];
    const stores = await Store.findAll({ where, include: [{ model: Rating }] , order: [[sortBy, dir]] });
    const out = stores.map(s => {
      const ratings = s.Ratings || [];
      const avg = ratings.length ? (ratings.reduce((a,b)=>a+b.rating,0)/ratings.length) : null;
      return { id: s.id, name: s.name, email: s.email, address: s.address, averageRating: avg };
    });
    res.json(out);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
