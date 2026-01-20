import mongoose from "mongoose";

const hairServiceSchema = new mongoose.Schema(
  {
    /* ================== BASIC INFO ================== */
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    images: {
      type: [String],
      default: [],
    },

    /* ================== PRICING ================== */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    finalPrice: {
      type: Number,
      min: 0,
    },

    duration: {
      type: Number, // minutes
      required: true,
      min: 1,
    },

    /* ================== SERVICE DISCOUNT ================== */
    serviceDiscount: {
      percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      startAt: Date,
      endAt: Date,

      isActive: {
        type: Boolean,
        default: false,
        index: true,
      },
    },

    /* ================== COMBO ================== */
    isCombo: {
      type: Boolean,
      default: false,
      index: true,
    },
    combo: {
    originalPrice: {
      type: Number, // tổng giá gốc các dịch vụ
      min: 0,
    },

    comboPrice: {
      type: Number, // giá bán combo
      min: 0,
    },

    endAt: {
      type: Date, // ngày kết thúc combo
    },
  },
    includedServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HairService",
      },
    ],

    /* ================== STATS ================== */
    bookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    weeklyBookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthlyBookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastBookedAt: Date,

    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    /* ================== RATING ================== */
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ================== RANKING ================== */
    popularityScore: {
      type: Number,
      default: 0,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    /* ================== STATUS ================== */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("HairService", hairServiceSchema);
