const express = require('express');
const router = express.Router();
const { Store, Rating, User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');

// Public: list stores with overall rating and user's submitted rating if authenticated (optional token)
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const where = q ? { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { address: { [Op.like]: `%${q}%` } }] } : {};
    const stores = await Store.findAll({ where, include: [{ model: Rating }] });
    // compute averages
    const token = (req.headers.authorization || '').split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        userId = payload.id;
      } catch(_) {}
    }
    const out = stores.map(s => {
      const ratings = s.Ratings || [];
      const avg = ratings.length ? (ratings.reduce((a,b)=>a+b.rating,0)/ratings.length) : null;
      const userRatingObj = ratings.find(r => r.userId === userId);
      return { id: s.id, name: s.name, address: s.address, averageRating: avg, userRating: userRatingObj ? userRatingObj.rating : null };
    });
    res.json(out);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit or update rating - user only
router.post('/:storeId/rate', authMiddleware, requireRole('user'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const existing = await Rating.findOne({ where: { storeId, userId: req.user.id }});
    if (existing) {
      existing.rating = rating;
      await existing.save();
      return res.json({ message: 'Rating updated' });
    } else {
      await Rating.create({ storeId, userId: req.user.id, rating });
      return res.json({ message: 'Rating created' });
    }
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Store owner: view ratings for their store(s)
router.get('/owner/ratings', authMiddleware, requireRole('store_owner'), async (req, res) => {
  try {
    const stores = await Store.findAll({ where: { ownerId: req.user.id }, include: [{ model: Rating, include: [{ model: User, attributes: ['id','name','email'] }] }] });
    const out = stores.map(s => {
      const ratings = s.Ratings || [];
      const avg = ratings.length ? (ratings.reduce((a,b)=>a+b.rating,0)/ratings.length) : null;
      return { storeId: s.id, name: s.name, averageRating: avg, ratings: ratings.map(r => ({ id: r.id, rating: r.rating, user: r.User })) };
    });
    res.json(out);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
