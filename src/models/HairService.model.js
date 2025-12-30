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
      type: String,
      trim: true,
      index: true,
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

    /* ================== SEO ================== */
    seo: {
      title: String,
      description: String,
      keywords: [String],
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

/* =====================================================
   PRE SAVE LOGIC (AUTO CALCULATION)
===================================================== */
hairServiceSchema.pre("save", function () {
  const now = new Date();

  /* ===== SERVICE DISCOUNT ===== */
  if (
    this.serviceDiscount?.percent > 0 &&
    this.serviceDiscount?.startAt &&
    this.serviceDiscount?.endAt &&
    now >= this.serviceDiscount.startAt &&
    now <= this.serviceDiscount.endAt
  ) {
    this.serviceDiscount.isActive = true;

    this.finalPrice =
      this.price -
      (this.price * this.serviceDiscount.percent) / 100;
  } else {
    this.serviceDiscount.isActive = false;
    this.finalPrice = this.price;
  }

  /* ===== CONVERSION RATE ===== */
  if (this.viewCount > 0) {
    this.conversionRate = this.bookingCount / this.viewCount;
  } else {
    this.conversionRate = 0;
  }

  /* ===== POPULARITY SCORE ===== */
  this.popularityScore =
    this.bookingCount * 0.4 +
    this.weeklyBookingCount * 0.2 +
    this.monthlyBookingCount * 0.2 +
    this.favoriteCount * 0.1 +
    this.ratingAverage * this.ratingCount * 0.05 +
    this.conversionRate * 100 * 0.05;

  /* ===== FEATURED (AUTO) ===== */
  this.isFeatured =
    this.bookingCount >= 50 &&
    this.ratingAverage >= 4.2 &&
    this.popularityScore >= 70;

  /* ===== PRIORITY (AUTO) ===== */
  const recencyBonus = this.lastBookedAt
    ? Math.max(
        0,
        30 -
          Math.floor(
            (Date.now() - this.lastBookedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
      )
    : 0;

  this.priority =
    this.popularityScore * 0.7 +
    this.ratingAverage * 10 +
    this.conversionRate * 100 +
    recencyBonus;
});

/* ================== INDEX TỐI ƯU ================== */
hairServiceSchema.index({
  isFeatured: -1,
  priority: -1,
  popularityScore: -1,
});

hairServiceSchema.index({
  category: 1,
  finalPrice: 1,
});

export default mongoose.model("HairService", hairServiceSchema);
