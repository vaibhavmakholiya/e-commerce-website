const { Product, Category } = require('../models');

// Fallback seed catalog in memory ensuring the API always serves catalog even during local initial boot
const MEMORY_FALLBACK_PRODUCTS = [
  {
    _id: '670f00010000000000000001',
    id: 'p1',
    name: 'Samsung Galaxy S25 Ultra 5G',
    slug: 'samsung-galaxy-s25-ultra',
    SKU: 'SKU-ELEC-S25U',
    categorySlug: 'electronics',
    brand: 'Samsung',
    price: 134999,
    compareAtPrice: 119999,
    inventoryQuantity: 24,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'Snapdragon 8 Elite, 200MP AI Quad Camera, and Built-in S-Pen.',
    description: 'Next-generation computing powered by Snapdragon 8 Elite with 200MP nightography and durable Titanium frame.',
    features: ['6.8" Dynamic AMOLED 2X 120Hz', 'Built-in S-Pen', 'IP68 water resistance'],
    ratingsSummary: { averageRating: 4.8, totalReviews: 3420 },
    isActive: true,
    isFeatured: true,
    isTrending: true
  },
  {
    _id: '670f00010000000000000002',
    id: 'p2',
    name: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    SKU: 'SKU-ELEC-XM5',
    categorySlug: 'electronics',
    brand: 'Sony',
    price: 34990,
    compareAtPrice: 26990,
    inventoryQuantity: 30,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'Industry-leading noise cancellation with two processors and 8 microphones.',
    description: 'Auto NC Optimizer automatically adjusts cancellation based on wearing conditions with 30-hour battery life.',
    features: ['30 hours battery life', 'Multipoint connection', 'AI crystal clear calls'],
    ratingsSummary: { averageRating: 4.9, totalReviews: 2180 },
    isActive: true,
    isFeatured: true,
    isTrending: true
  },
  {
    _id: '670f00010000000000000003',
    id: 'p3',
    name: 'Apple MacBook Air 15" M3 Chip',
    slug: 'apple-macbook-air-m3',
    SKU: 'SKU-ELEC-MBA15',
    categorySlug: 'electronics',
    brand: 'Apple',
    price: 134900,
    compareAtPrice: 124900,
    inventoryQuantity: 12,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'Liquid Retina display, M3 8-core CPU, up to 18 hours battery life.',
    description: 'Strikingly thin and fast with 15.3-inch Liquid Retina display and silent, fanless design.',
    features: ['Apple M3 chip', '15.3" Liquid Retina', 'MagSafe 3 fast charging'],
    ratingsSummary: { averageRating: 4.8, totalReviews: 1420 },
    isActive: true,
    isFeatured: true,
    isTrending: false
  },
  {
    _id: '670f00010000000000000004',
    id: 'p7',
    name: 'Pure European Linen Mandarin Collar Shirt',
    slug: 'pure-linen-mandarin-shirt',
    SKU: 'SKU-FASH-LINEN',
    categorySlug: 'fashion',
    brand: 'Nova Apparel',
    price: 3499,
    compareAtPrice: 2299,
    inventoryQuantity: 45,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '100% Normandy flax linen. Breathable, relaxed fit.',
    description: 'Crafted from sustainable 100% European flax linen offering unmatched breathability for Indian weather.',
    features: ['100% Pure certified linen', 'Mandarin band collar', 'Anti-microbial and lightweight'],
    ratingsSummary: { averageRating: 4.5, totalReviews: 680 },
    isActive: true,
    isFeatured: true,
    isTrending: false
  },
  {
    _id: '670f00010000000000000005',
    id: 'p13',
    name: 'Ergonomic Mesh High-Back Office Chair',
    slug: 'ergonomic-executive-mesh-chair',
    SKU: 'SKU-HOME-CHAIR',
    categorySlug: 'home-living',
    brand: 'Nova Living',
    price: 18990,
    compareAtPrice: 14490,
    inventoryQuantity: 18,
    images: ['https://images.unsplash.com/photo-1580481077195-c3f8224583c0?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'Adaptive 3D lumbar support, 4D armrests, breathable Korean mesh.',
    description: 'Orthopedic specialist consultation design to eliminate posture fatigue during 8+ hour work days.',
    features: ['Synchro-tilt recline (90°-135°)', 'Class 4 BIFMA gas lift', 'Dynamic lumbar support'],
    ratingsSummary: { averageRating: 4.7, totalReviews: 1650 },
    isActive: true,
    isFeatured: true,
    isTrending: true
  },
  {
    _id: '670f00010000000000000006',
    id: 'p19',
    name: 'Artisan Full-Grain Bifold Leather Wallet',
    slug: 'handcrafted-full-grain-leather-wallet',
    SKU: 'SKU-ACC-WALLET',
    categorySlug: 'accessories',
    brand: 'Nova Craft',
    price: 2499,
    compareAtPrice: 1699,
    inventoryQuantity: 50,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'Vegetable-tanned full-grain leather, RFID-blocking lining, 8 card slots.',
    description: 'Full-grain vegetable-tanned leather that develops a lustrous patina over time with military-grade RFID shielding.',
    features: ['Italian vegetable-tanned leather', 'RFID skimming protection', 'Slim pocket profile'],
    ratingsSummary: { averageRating: 4.8, totalReviews: 1420 },
    isActive: true,
    isFeatured: true,
    isTrending: false
  }
];

const MEMORY_CATEGORIES = [
  { _id: 'cat_1', name: 'Electronics', slug: 'electronics', icon: '💻', count: 3, isActive: true },
  { _id: 'cat_2', name: 'Fashion', slug: 'fashion', icon: '👗', count: 1, isActive: true },
  { _id: 'cat_3', name: 'Home & Living', slug: 'home-living', icon: '🏠', count: 1, isActive: true },
  { _id: 'cat_4', name: 'Accessories', slug: 'accessories', icon: '⌚', count: 1, isActive: true }
];

/**
 * Query products with multi-facet filters, sorting, and pagination
 */
const queryProducts = async ({
  page = 1,
  limit = 12,
  category,
  search,
  minPrice,
  maxPrice,
  rating,
  inStock,
  sort = 'featured'
}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (p - 1) * l;

  // If MongoDB is connected and populated
  if (Product.db.readyState === 1) {
    const filter = { isActive: true };

    if (category) {
      filter.$or = [
        { categorySlug: category.toLowerCase() },
        ...(category.match(/^[0-9a-fA-F]{24}$/) ? [{ category: category }] : [])
      ];
    }

    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter['ratingsSummary.averageRating'] = { $gte: Number(rating) };
    }

    if (inStock === 'true' || inStock === true) {
      filter.inventoryQuantity = { $gt: 0 };
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'price-asc':
        sortObj = { price: 1 };
        break;
      case 'price-desc':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { 'ratingsSummary.averageRating': -1 };
        break;
      case 'popular':
        sortObj = { 'ratingsSummary.totalReviews': -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'featured':
      default:
        sortObj = { isFeatured: -1, createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug icon')
        .sort(sortObj)
        .skip(skip)
        .limit(l)
        .lean(),
      Product.countDocuments(filter)
    ]);

    if (total > 0) {
      return {
        products,
        pagination: {
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l),
          hasNext: p < Math.ceil(total / l),
          hasPrev: p > 1
        }
      };
    }
  }

  // Resilient memory filter
  let list = [...MEMORY_FALLBACK_PRODUCTS];

  if (category) {
    list = list.filter((pr) => pr.categorySlug === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (pr) =>
        pr.name.toLowerCase().includes(q) ||
        pr.description.toLowerCase().includes(q) ||
        pr.brand.toLowerCase().includes(q)
    );
  }

  if (maxPrice) {
    list = list.filter((pr) => pr.price <= Number(maxPrice));
  }

  if (rating) {
    list = list.filter((pr) => pr.ratingsSummary.averageRating >= Number(rating));
  }

  if (inStock) {
    list = list.filter((pr) => pr.inventoryQuantity > 0);
  }

  // Sort
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating') list.sort((a, b) => b.ratingsSummary.averageRating - a.ratingsSummary.averageRating);
  if (sort === 'popular') list.sort((a, b) => b.ratingsSummary.totalReviews - a.ratingsSummary.totalReviews);

  const total = list.length;
  const paginated = list.slice(skip, skip + l);

  return {
    products: paginated,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
      hasNext: p < Math.ceil(total / l),
      hasPrev: p > 1
    }
  };
};

/**
 * Get product by ObjectId or ID
 */
const getProductById = async (id) => {
  if (Product.db.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
    const p = await Product.findById(id).populate('category', 'name slug icon').lean();
    if (p) return p;
  }
  return (
    MEMORY_FALLBACK_PRODUCTS.find((p) => p.id === id || p._id === id || p.slug === id) || null
  );
};

/**
 * Get product by slug
 */
const getProductBySlug = async (slug) => {
  if (Product.db.readyState === 1) {
    const p = await Product.findOne({ slug: slug.toLowerCase() })
      .populate('category', 'name slug icon')
      .lean();
    if (p) return p;
  }
  return MEMORY_FALLBACK_PRODUCTS.find((p) => p.slug === slug.toLowerCase()) || null;
};

/**
 * Get categories list
 */
const getCategories = async () => {
  if (Category.db.readyState === 1) {
    const categories = await Category.find({ isActive: true }).lean();
    if (categories.length > 0) return categories;
  }
  return MEMORY_CATEGORIES;
};

/**
 * Create a new product (Admin)
 */
const createProduct = async (data) => {
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  if (Product.db.readyState === 1) {
    const product = await Product.create({
      ...data,
      slug
    });
    return product;
  }

  // Memory append for local test runs
  const memProd = {
    _id: 'prod_' + Date.now(),
    id: 'p_' + Date.now(),
    ...data,
    slug,
    ratingsSummary: { averageRating: 0, totalReviews: 0 },
    createdAt: new Date().toISOString()
  };
  MEMORY_FALLBACK_PRODUCTS.unshift(memProd);
  return memProd;
};

/**
 * Update an existing product (Admin)
 */
const updateProduct = async (id, data) => {
  if (Product.db.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
    const updated = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (updated) return updated;
  }

  const idx = MEMORY_FALLBACK_PRODUCTS.findIndex((p) => p.id === id || p._id === id);
  if (idx !== -1) {
    MEMORY_FALLBACK_PRODUCTS[idx] = { ...MEMORY_FALLBACK_PRODUCTS[idx], ...data };
    return MEMORY_FALLBACK_PRODUCTS[idx];
  }

  return null;
};

/**
 * Delete a product (Admin)
 */
const deleteProduct = async (id) => {
  if (Product.db.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
    const deleted = await Product.findByIdAndDelete(id);
    if (deleted) return true;
  }

  const idx = MEMORY_FALLBACK_PRODUCTS.findIndex((p) => p.id === id || p._id === id);
  if (idx !== -1) {
    MEMORY_FALLBACK_PRODUCTS.splice(idx, 1);
    return true;
  }

  return false;
};

module.exports = {
  queryProducts,
  getProductById,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  MEMORY_FALLBACK_PRODUCTS
};
