const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Lead = require('../models/Lead');

const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH', 'NC', 'CA', 'IN', 'WA', 'CO', 'DC'];
const companies = ['Tech Corp', 'StartupXYZ', 'Global Solutions', 'Innovation Labs', 'Digital Agency', 'Consulting Group', 'Software Inc', 'Data Systems', 'Cloud Services', 'Mobile Apps', 'AI Solutions', 'Blockchain Co', 'E-commerce Pro', 'Marketing Masters', 'Sales Force', 'Customer Success', 'Growth Hacking', 'Product Labs', 'Design Studio', 'Analytics Pro'];

// More realistic first and last names
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald', 'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const generateRandomLead = (userId) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const cityIndex = Math.floor(Math.random() * cities.length);
  
  // More realistic status distribution
  const statusWeights = {
    'new': 0.3,
    'contacted': 0.25,
    'qualified': 0.2,
    'won': 0.15,
    'lost': 0.1
  };
  
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedStatus = 'new';
  
  for (const [status, weight] of Object.entries(statusWeights)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      selectedStatus = status;
      break;
    }
  }
  
  // More realistic score distribution based on status
  let score;
  if (selectedStatus === 'won') {
    score = Math.floor(Math.random() * 20) + 80; // 80-100
  } else if (selectedStatus === 'qualified') {
    score = Math.floor(Math.random() * 20) + 60; // 60-79
  } else if (selectedStatus === 'contacted') {
    score = Math.floor(Math.random() * 20) + 40; // 40-59
  } else if (selectedStatus === 'new') {
    score = Math.floor(Math.random() * 20) + 20; // 20-39
  } else { // lost
    score = Math.floor(Math.random() * 20) + 0; // 0-19
  }
  
  // More realistic lead value based on status and score
  let baseValue = 100;
  if (selectedStatus === 'won') baseValue = 5000;
  else if (selectedStatus === 'qualified') baseValue = 2000;
  else if (selectedStatus === 'contacted') baseValue = 500;
  
  const leadValue = parseFloat((baseValue + (Math.random() * baseValue * 0.5)).toFixed(2));
  
  // Create leads over the last 6 months
  const monthsAgo = Math.floor(Math.random() * 6);
  const createdAt = new Date();
  createdAt.setMonth(createdAt.getMonth() - monthsAgo);
  createdAt.setDate(Math.floor(Math.random() * 28) + 1);
  
  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    company: companies[Math.floor(Math.random() * companies.length)],
    city: cities[cityIndex],
    state: states[cityIndex],
    source: sources[Math.floor(Math.random() * sources.length)],
    status: selectedStatus,
    score,
    leadValue,
    lastActivityAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    isQualified: selectedStatus === 'qualified' || selectedStatus === 'won' || Math.random() > 0.8,
    userId,
    createdAt
  };
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminUser = new User({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User'
    });
    
    await adminUser.save();
    console.log('Admin user created: admin@test.com / password123');
    
    // Generate 200 leads for better dashboard visualization
    const leads = [];
    for (let i = 0; i < 200; i++) {
      leads.push(generateRandomLead(adminUser._id));
    }
    
    await Lead.insertMany(leads);
    console.log(`${leads.length} leads created successfully`);
    
    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    process.exit(1);
  }
};

seedData();