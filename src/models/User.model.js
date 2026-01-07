import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    avatar: {
      type: String,
      default: ''
    },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
    },
    staffRequested: {
      type: Boolean,
      default: false
    },
    staffRequestedAt: Date,
    isOnline: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    loyalty: {
      points: { type: Number, default: 0 },
      level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'vip'],
        default: 'bronze'
      }
    },
    stats: {
      bookingCount: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      lastBookingAt: { type: Date },
      lastActiveAt: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
