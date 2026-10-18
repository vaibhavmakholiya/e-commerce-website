const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '📦'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
