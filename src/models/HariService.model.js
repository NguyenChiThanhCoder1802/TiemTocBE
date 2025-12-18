import mongoose from "mongoose";

const hairServiceSchema = new mongoose.Schema(
  {
    /* ================== THÔNG TIN CƠ BẢN ================== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: Number, // phút
      required: true,
      min: 1,
    },

    category: {
      type: String,
      trim: true,
      index: true,
    },

    images: {
      type: [String],
      default: [],
    },

    /* ================== THỐNG KÊ – PHỔ BIẾN ================== */
    bookingCount: {
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

    lastBookedAt: {
      type: Date,
    },

    weeklyBookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ================== ĐÁNH GIÁ ================== */
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

    /* ================== XẾP HẠNG – NỔI BẬT ================== */
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
    },

    /* ================== KINH DOANH ================== */
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    /* ================== TRẠNG THÁI ================== */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== INDEX TỐI ƯU SORT ================== */
hairServiceSchema.index({
  isFeatured: -1,
  popularityScore: -1,
  bookingCount: -1,
});

export default mongoose.model("HairService", hairServiceSchema);
