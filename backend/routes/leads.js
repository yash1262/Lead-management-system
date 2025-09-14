const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Create lead
router.post('/', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().notEmpty(),
  body('company').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').isInt({ min: 0, max: 100 }),
  body('leadValue').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const leadData = {
      ...req.body,
      userId: req.user._id
    };

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error while creating lead' });
  }
});

// Get leads with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { userId: req.user._id };

    // Apply filters
    if (req.query.email) {
      if (req.query.emailOp === 'contains') {
        filter.email = new RegExp(req.query.email, 'i');
      } else {
        filter.email = req.query.email;
      }
    }

    if (req.query.company) {
      if (req.query.companyOp === 'contains') {
        filter.company = new RegExp(req.query.company, 'i');
      } else {
        filter.company = req.query.company;
      }
    }

    if (req.query.city) {
      if (req.query.cityOp === 'contains') {
        filter.city = new RegExp(req.query.city, 'i');
      } else {
        filter.city = req.query.city;
      }
    }

    if (req.query.status) {
      if (req.query.statusOp === 'in' && Array.isArray(req.query.status)) {
        filter.status = { $in: req.query.status };
      } else {
        filter.status = req.query.status;
      }
    }

    if (req.query.source) {
      if (req.query.sourceOp === 'in' && Array.isArray(req.query.source)) {
        filter.source = { $in: req.query.source };
      } else {
        filter.source = req.query.source;
      }
    }

    if (req.query.score) {
      const score = parseInt(req.query.score);
      const scoreOp = req.query.scoreOp;
      
      if (scoreOp === 'gt') {
        filter.score = { $gt: score };
      } else if (scoreOp === 'lt') {
        filter.score = { $lt: score };
      } else if (scoreOp === 'between' && req.query.scoreMax) {
        filter.score = { $gte: score, $lte: parseInt(req.query.scoreMax) };
      } else {
        filter.score = score;
      }
    }

    if (req.query.leadValue) {
      const value = parseFloat(req.query.leadValue);
      const valueOp = req.query.leadValueOp;
      
      if (valueOp === 'gt') {
        filter.leadValue = { $gt: value };
      } else if (valueOp === 'lt') {
        filter.leadValue = { $lt: value };
      } else if (valueOp === 'between' && req.query.leadValueMax) {
        filter.leadValue = { $gte: value, $lte: parseFloat(req.query.leadValueMax) };
      } else {
        filter.leadValue = value;
      }
    }

    if (req.query.isQualified !== undefined) {
      filter.isQualified = req.query.isQualified === 'true';
    }

    // Date filters
    if (req.query.createdAt) {
      const date = new Date(req.query.createdAt);
      const createdAtOp = req.query.createdAtOp;
      
      if (createdAtOp === 'before') {
        filter.createdAt = { $lt: date };
      } else if (createdAtOp === 'after') {
        filter.createdAt = { $gt: date };
      } else if (createdAtOp === 'between' && req.query.createdAtEnd) {
        filter.createdAt = { $gte: date, $lte: new Date(req.query.createdAtEnd) };
      } else {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Execute query
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error while fetching lead' });
  }
});

// Update lead
router.put('/:id', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().notEmpty(),
  body('company').optional().trim().notEmpty(),
  body('city').optional().trim().notEmpty(),
  body('state').optional().trim().notEmpty(),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('leadValue').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    console.log('Update lead request:', req.params.id, req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error while updating lead' });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error while deleting lead' });
  }
});

module.exports = router;