import mongoose from "mongoose";

const discountCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Số tiền giảm tối đa
     * (áp dụng khi discountType = percent)
     */
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },

    /* ================= APPLY CONDITIONS ================= */
    /**
     * Giá trị tối thiểu để được áp mã
     * - service → giá dịch vụ
     */
    minValue: {
      type: Number,
      default: 0,
      min: 0,
    },

     /**
     * Danh sách dịch vụ được áp mã
     * - Rỗng => áp cho tất cả dịch vụ
     */
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HairService",
        index: true,
      },
    ],

 
    userLimit: {
      type: Number,
      default: 1,
      min: 1,
    },

   
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    usedQuantity: {
      type: Number,
      default: 0,
    },

    
    usedByUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          index: true,
        },
        usedCount: {
          type: Number,
          default: 1,
        },
        lastUsedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= TIME ================= */
    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    /* ================= STATUS ================= */
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

/* ================= INDEX TỐI ƯU ================= */
discountCardSchema.index({
  code: 1,
  isActive: 1,
  isDeleted: 1,
});

discountCardSchema.index({
  startDate: 1,
  endDate: 1,
});

export default mongoose.model("DiscountCard", discountCardSchema);
