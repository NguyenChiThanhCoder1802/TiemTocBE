import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    /* ================== CUSTOMER INFO ================== */
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* ================== STAFF INFO ================== */
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true
    },

    autoAssigned: {
      type: Boolean,
      default: false
    },

    /* ================== SERVICES ================== */
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HairService",
          required: true
        },

        name: {
          type: String,
          required: true
        },

        images: {
          type: [String],
          default: []
        },

        price: {
          type: Number,
          required: true,
          min: 0
        },

        finalPrice: {
          type: Number,
          required: true,
          min: 0
        },

        duration: {
          type: Number,
          required: true // minutes
        }
      }
    ],

    /* ================== BOOKING TIME ================== */
    bookingDate: {
      type: Date,
      required: true,
      index: true
    },

    startTime: {
      type: Date,
      required: true,
      index: true
    },

    endTime: {
      type: Date,
      required: true
    },

    /* ================== BOOKING TYPE ================== */
    bookingType: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
      index: true
    },

    urgentFee: {
      type: Number,
      default: 0,
      min: 0
    },

    /* ================== DISCOUNT INFO ================== */
    discountCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountCard",
      default: null
    },

    discountCode: {
      type: String,
      default: null
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    /* ================== PRICE CALCULATION ================== */
    subTotal: {
      type: Number,
      required: true,
      min: 0
    },

    totalDiscount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    /* ================== STATUS ================== */
    bookingStatus: {
      type: String,
      enum: [
        "pending",     // chờ thanh toán / xác nhận
        "confirmed",   // đã xác nhận
        "in_progress", // đang làm
        "completed",   // hoàn thành
        "cancelled",   // hủy
        "no_show"      // khách không đến
      ],
      default: "pending",
      index: true
    },

    /* ================== CANCELLATION INFO ================== */
    cancelReason: {
      type: String,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    /* ================== COMPLETION INFO ================== */
    completedAt: {
      type: Date,
      default: null
    },

    /* ================== APPROVAL INFO ================== */
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    approvedAt: {
      type: Date,
      default: null
    },

    /* ================== OTHER INFO ================== */
    note: {
      type: String,
      default: null
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);
bookingSchema.index({
  staff: 1,
  bookingDate: 1,
  startTime: 1,
  endTime: 1,
  bookingStatus: 1
});

export default mongoose.model("Booking", bookingSchema);
