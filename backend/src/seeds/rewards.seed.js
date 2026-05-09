const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Reward = require('../models/Reward');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rewardsData = [
  {
    key: 'canteen_10pct',
    title: 'Canteen 10% Discount',
    category: 'food',
    creditCost: 100,
    icon: '🍱',
    validityHours: 24,
    isBikeUnlock: false,
    description: 'Get 10% off your next canteen meal.',
    howToUse: 'Show the QR code or voucher code to the billing counter staff before payment.',
  },
  {
    key: 'canteen_20pct',
    title: 'Canteen 20% Discount',
    category: 'food',
    creditCost: 180,
    icon: '🍛',
    validityHours: 24,
    isBikeUnlock: false,
    description: 'Get 20% off your next canteen meal.',
    howToUse: 'Show the QR code or voucher code to the billing counter staff before payment.',
  },
  {
    key: 'library_priority',
    title: 'Library Priority Booking',
    category: 'study',
    creditCost: 50,
    icon: '📚',
    validityHours: 168,
    isBikeUnlock: false,
    description: 'Skip the queue for study room booking.',
    howToUse: 'Show this voucher at the library front desk when booking a study room.',
  },
  {
    key: 'library_extended',
    title: 'Extended Library Hours',
    category: 'study',
    creditCost: 75,
    icon: '🔖',
    validityHours: 168,
    isBikeUnlock: false,
    description: 'Access the library 1 hour before opening.',
    howToUse: 'Show this voucher to the library guard during early access hours.',
  },
  {
    key: 'print_credits',
    title: '50 Free Print Pages',
    category: 'study',
    creditCost: 80,
    icon: '🖨️',
    validityHours: 720,
    isBikeUnlock: false,
    description: '50 free black & white prints at campus center.',
    howToUse: 'Show this voucher at the campus printing center before your print job.',
  },
  {
    key: 'bike_unlock',
    title: 'Free Campus Bike Unlock',
    category: 'transport',
    creditCost: 200,
    icon: '🚲',
    validityHours: 2,
    isBikeUnlock: true,
    description:
      'Unlock a campus bike free for 2 hours. The reward that powers itself - you biked to earn it, now bike more.',
    howToUse: 'Show the QR code at the campus bike stand to the attendant for a free 2-hour unlock.',
  },
  {
    key: 'parking_priority',
    title: 'Green Parking Priority',
    category: 'transport',
    creditCost: 150,
    icon: '🅿️',
    validityHours: 24,
    isBikeUnlock: false,
    description: 'Reserved parking for verdi-friendly vehicles.',
    howToUse: 'Show this voucher at the campus parking gate for a reserved verdi-vehicle spot.',
  },
  {
    key: 'campus_store_15pct',
    title: 'Campus Store 15% Off',
    category: 'store',
    creditCost: 120,
    icon: '🛍️',
    validityHours: 72,
    isBikeUnlock: false,
    description: '15% off at campus stationery and bookstore.',
    howToUse: 'Show this voucher to the store cashier before billing.',
  },
];

async function seedRewards() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const reward of rewardsData) {
      const result = await Reward.findOneAndUpdate(
        { key: reward.key },
        { $set: reward },
        { upsert: true, new: true }
      );
      console.log(`Seeded reward: ${result.title}`);
    }

    console.log('Rewards seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rewards:', error);
    process.exit(1);
  }
}

seedRewards();
