import mongoose from "mongoose";

const comboServiceSchema = new mongoose.Schema(
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
      index: true,
      immutable: true, // ⬅️ MongoDB level: không cho update
    },
    images: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    /* ================== INCLUDED SERVICES ================== */
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HairService",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],

    /* ================== PRICING ================== */
    pricing: {
      originalPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      comboPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    duration: {
      type: Number, // tổng thời gian combo
      required: true,
      min: 1,
    },

    /* ================== ACTIVE PERIOD ================== */
    activePeriod: {
      startAt: Date,
      endAt: Date,
    },

    /* ================== STATS ================== */
    stats: {
      bookingCount: { type: Number, default: 0 },
      favoriteCount: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
    },

    /* ================== RATING ================== */
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
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
  { timestamps: true }
);

export default mongoose.model("ComboService", comboServiceSchema);
