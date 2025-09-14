const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
    default: 'new'
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be between 0 and 100'],
    max: [100, 'Score must be between 0 and 100']
  },
  leadValue: {
    type: Number,
    required: [true, 'Lead value is required'],
    min: [0, 'Lead value must be positive']
  },
  lastActivityAt: {
    type: Date,
    default: null
  },
  isQualified: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
leadSchema.index({ email: 1, userId: 1 }, { unique: true });
leadSchema.index({ userId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);