require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@rentflatmate.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await User.create({ name: 'Platform Admin', email, password, role: 'admin' });
  console.log(`Admin user created: ${email} / ${password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
