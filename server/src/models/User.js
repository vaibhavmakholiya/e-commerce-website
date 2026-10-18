const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required for shipping address'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required for shipping address'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
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
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      match: [/^[1-9]\d{5}$/, 'Please enter a valid 6-digit Indian PIN code']
    },
    tag: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    authProvider: {
      type: String,
      enum: ['supabase', 'local', 'firebase'],
      default: 'supabase',
      required: true
    },
    providerUserId: {
      type: String,
      required: [true, 'Authentication provider user ID is required'],
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'customer',
      required: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    shippingAddresses: [addressSchema],
    preferences: {
      currency: {
        type: String,
        default: 'INR'
      },
      language: {
        type: String,
        default: 'en'
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Never expose provider internal ID or sensitive fields in toJSON if needed
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
