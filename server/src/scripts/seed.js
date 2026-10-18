const mongoose = require('mongoose');
const config = require('../config/env');
const {
  User,
  Category,
  Product,
  Coupon,
  Review,
  Order,
  Cart
} = require('../models');

// Fictional dataset labeled clearly for local development
const SEED_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, noise-cancelling audio, workstations, and wearables',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
    icon: '💻',
    isActive: true
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Handcrafted linen apparel, celebratory ethnic wear, and minimalist sneakers',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    icon: '👗',
    isActive: true
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Ergonomic work-from-home furniture, artisan ceramics, and smart lighting',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    icon: '🏠',
    isActive: true
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Full-grain Italian leather wallets, titanium eyewear, and automatic watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    icon: '⌚',
    isActive: true
  }
];

const SEED_COUPONS = [
  {
    code: 'WELCOME100',
    description: 'Flat ₹100 discount on your first order over ₹499',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 499,
    validUntil: new Date('2028-12-31'),
    usageLimit: 5000,
    isActive: true
  },
  {
    code: 'FESTIVE15',
    description: '15% off up to ₹1,500 on festive collections over ₹1,999',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 1500,
    minOrderAmount: 1999,
    validUntil: new Date('2028-12-31'),
    usageLimit: 2500,
    isActive: true
  },
  {
    code: 'NOVA500',
    description: 'Flat ₹500 off on premium orders over ₹4,999',
    discountType: 'flat',
    discountValue: 500,
    minOrderAmount: 4999,
    validUntil: new Date('2028-12-31'),
    usageLimit: 1000,
    isActive: true
  }
];

const seedDatabase = async () => {
  console.log(`[Seed Script] Connecting to database at ${config.mongoUri}...`);

  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed Script] Connected successfully.');

    // 1. Clear existing seed collections
    console.log('[Seed Script] Cleaning existing database collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      User.deleteMany({})
    ]);

    // 2. Insert Categories
    console.log('[Seed Script] Seeding product categories...');
    const createdCategories = await Category.insertMany(SEED_CATEGORIES);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 3. Insert Users (Admin + Demo Customer)
    console.log('[Seed Script] Seeding default users (Admin + Demo Customer)...');
    const adminUser = await User.create({
      authProvider: 'supabase',
      providerUserId: 'admin_root_001',
      name: 'NovaCart Admin Team',
      email: 'admin@novacart.in',
      role: 'admin',
      phone: '9800011122',
      shippingAddresses: []
    });

    const demoCustomer = await User.create({
      authProvider: 'supabase',
      providerUserId: 'usr_demo_8821',
      name: 'Arjun Sharma',
      email: 'arjun.sharma@example.in',
      role: 'customer',
      phone: '9876543210',
      shippingAddresses: [
        {
          fullName: 'Arjun Sharma',
          phone: '9876543210',
          street: 'Flat 402, Green Glen Layout, Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          tag: 'Home',
          isDefault: true
        },
        {
          fullName: 'Arjun Sharma (Office)',
          phone: '9876543210',
          street: 'EcoSpace Tech Park, 4th Floor, Outer Ring Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          tag: 'Work',
          isDefault: false
        }
      ]
    });

    // 4. Insert Products with realistic catalog details
    console.log('[Seed Script] Seeding products...');
    const seedProducts = [
      {
        name: 'Samsung Galaxy S25 Ultra 5G',
        slug: 'samsung-galaxy-s25-ultra',
        SKU: 'SKU-ELEC-S25U',
        category: categoryMap['electronics'],
        categorySlug: 'electronics',
        brand: 'Samsung',
        price: 134999,
        compareAtPrice: 119999,
        inventoryQuantity: 24,
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: 'Snapdragon 8 Elite, 200MP AI Quad Camera, and Built-in S-Pen.',
        description: 'Next-generation computing powered by Snapdragon 8 Elite with 200MP nightography and durable Titanium frame.',
        features: ['6.8" Dynamic AMOLED 2X 120Hz', 'Built-in low latency S-Pen', 'IP68 water resistance'],
        attributes: { Processor: 'Snapdragon 8 Elite', RAM: '12 GB', Storage: '256 GB' },
        variants: [{ name: 'Color', options: ['Titanium Gray', 'Titanium Black'] }],
        isActive: true,
        isFeatured: true,
        isTrending: true
      },
      {
        name: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
        slug: 'sony-wh-1000xm5-headphones',
        SKU: 'SKU-ELEC-XM5',
        category: categoryMap['electronics'],
        categorySlug: 'electronics',
        brand: 'Sony',
        price: 34990,
        compareAtPrice: 26990,
        inventoryQuantity: 30,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: 'Industry-leading noise cancellation with two processors and 8 microphones.',
        description: 'Auto NC Optimizer automatically adjusts cancellation based on wearing conditions with 30-hour battery life.',
        features: ['30 hours battery life', 'Multipoint connection', 'AI crystal clear calls'],
        attributes: { Driver: '30 mm Carbon Fiber', Battery: '30 Hours' },
        variants: [{ name: 'Color', options: ['Black', 'Silver'] }],
        isActive: true,
        isFeatured: true,
        isTrending: true
      },
      {
        name: 'Apple MacBook Air 15" M3 Chip',
        slug: 'apple-macbook-air-m3',
        SKU: 'SKU-ELEC-MBA15',
        category: categoryMap['electronics'],
        categorySlug: 'electronics',
        brand: 'Apple',
        price: 134900,
        compareAtPrice: 124900,
        inventoryQuantity: 12,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: 'Liquid Retina display, M3 8-core CPU, up to 18 hours battery life.',
        description: 'Strikingly thin and fast with 15.3-inch Liquid Retina display and silent, fanless design.',
        features: ['Apple M3 chip', '15.3" Liquid Retina', 'MagSafe 3 fast charging'],
        attributes: { Memory: '16 GB Unified', Storage: '512 GB SSD' },
        variants: [{ name: 'Color', options: ['Midnight', 'Starlight'] }],
        isActive: true,
        isFeatured: true,
        isTrending: false
      },
      {
        name: 'Pure European Linen Mandarin Collar Shirt',
        slug: 'pure-linen-mandarin-shirt',
        SKU: 'SKU-FASH-LINEN',
        category: categoryMap['fashion'],
        categorySlug: 'fashion',
        brand: 'Nova Apparel',
        price: 3499,
        compareAtPrice: 2299,
        inventoryQuantity: 45,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: '100% Normandy flax linen. Breathable, relaxed fit.',
        description: 'Crafted from sustainable 100% European flax linen offering unmatched breathability for Indian weather.',
        features: ['100% Pure certified linen', 'Mandarin band collar', 'Anti-microbial and lightweight'],
        attributes: { Material: '100% Linen', Fit: 'Relaxed' },
        variants: [
          { name: 'Color', options: ['Ivory White', 'Sage Green'] },
          { name: 'Size', options: ['M', 'L', 'XL'] }
        ],
        isActive: true,
        isFeatured: true,
        isTrending: false
      },
      {
        name: 'Ergonomic Mesh High-Back Office Chair',
        slug: 'ergonomic-executive-mesh-chair',
        SKU: 'SKU-HOME-CHAIR',
        category: categoryMap['home-living'],
        categorySlug: 'home-living',
        brand: 'Nova Living',
        price: 18990,
        compareAtPrice: 14490,
        inventoryQuantity: 18,
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3f8224583c0?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: 'Adaptive 3D lumbar support, 4D armrests, breathable Korean mesh.',
        description: 'Orthopedic specialist consultation design to eliminate posture fatigue during 8+ hour work days.',
        features: ['Synchro-tilt recline (90°-135°)', 'Class 4 BIFMA gas lift', 'Dynamic lumbar support'],
        attributes: { MaxWeight: '136 kg', Warranty: '3 Years' },
        variants: [{ name: 'Color', options: ['Stealth Black', 'Ash Gray'] }],
        isActive: true,
        isFeatured: true,
        isTrending: true
      },
      {
        name: 'Artisan Full-Grain Bifold Leather Wallet',
        slug: 'handcrafted-full-grain-leather-wallet',
        SKU: 'SKU-ACC-WALLET',
        category: categoryMap['accessories'],
        categorySlug: 'accessories',
        brand: 'Nova Craft',
        price: 2499,
        compareAtPrice: 1699,
        inventoryQuantity: 50,
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
        ],
        shortDescription: 'Vegetable-tanned full-grain leather, RFID-blocking lining, 8 card slots.',
        description: 'Full-grain vegetable-tanned leather that develops a lustrous patina over time with military-grade RFID shielding.',
        features: ['Italian vegetable-tanned leather', 'RFID skimming protection', 'Slim pocket profile'],
        attributes: { Dimensions: '11 x 9 x 1.5 cm' },
        variants: [{ name: 'Color', options: ['Vintage Tan', 'Espresso Brown'] }],
        isActive: true,
        isFeatured: true,
        isTrending: false
      }
    ];

    const createdProducts = await Product.insertMany(seedProducts);

    // 5. Insert Coupons
    console.log('[Seed Script] Seeding coupons...');
    await Coupon.insertMany(SEED_COUPONS);

    // 6. Insert Reviews
    console.log('[Seed Script] Seeding verified product reviews...');
    await Review.create({
      customer: demoCustomer._id,
      product: createdProducts[1]._id, // Sony Headphones
      customerName: 'Arjun Sharma',
      rating: 5,
      title: 'Flawless noise cancellation',
      reviewText: 'Blocks metro noise and office background chatter completely. Battery lasts almost all week.',
      moderationStatus: 'Approved',
      isVerifiedPurchase: true
    });

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`• Categories: ${createdCategories.length}`);
    console.log(`• Products:   ${createdProducts.length}`);
    console.log(`• Users:      2 (Admin: admin@novacart.in, Customer: arjun.sharma@example.in)`);
    console.log(`• Coupons:    ${SEED_COUPONS.length} (WELCOME100, FESTIVE15, NOVA500)`);
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
