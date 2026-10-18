const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [
      {
        type: String,
        required: true,
        trim: true
      }
    ]
  },
  { _id: false }
);

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    SKU: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category reference is required'],
      index: true
    },
    categorySlug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      trim: true,
      default: 'NovaCart'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be 0 or greater']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare-at price must be 0 or greater'],
      default: null
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one product image is required'
      }
    },
    inventoryQuantity: {
      type: Number,
      required: [true, 'Inventory quantity is required'],
      min: [0, 'Inventory quantity cannot be negative'],
      default: 0
    },
    variants: [variantSchema],
    attributes: {
      type: Map,
      of: String,
      default: {}
    },
    features: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },
    ratingsSummary: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Full-text search index across name, description, and brand
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Compound indexes for high-frequency queries
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isTrending: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
