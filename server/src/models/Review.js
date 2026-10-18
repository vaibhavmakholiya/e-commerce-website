const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true
    },
    moderationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved',
      index: true
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from the same customer for the same product
reviewSchema.index({ customer: 1, product: 1 }, { unique: true });

// Static method to recalculate product average rating
reviewSchema.statics.calculateProductRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        moderationStatus: 'Approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const Product = mongoose.model('Product');

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratingsSummary.averageRating': Math.round(stats[0].averageRating * 10) / 10,
      'ratingsSummary.totalReviews': stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratingsSummary.averageRating': 0,
      'ratingsSummary.totalReviews': 0
    });
  }
};

// Trigger recalculation after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateProductRating(this.product);
});

// Trigger recalculation after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateProductRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
