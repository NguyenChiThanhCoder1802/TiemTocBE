import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true
    },
    bookingType: {
      type: String,
      enum: ["service", "combo"],
      required: true
    },
   services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HairService"
        },
        nameSnapshot: String,
        slugSnapshot: String,
        originalPriceSnapshot: Number,   // giá gốc
        serviceDiscountPercent: Number,  // % giảm của service
        priceAfterServiceDiscount: Number,
        durationSnapshot: Number,
        imageSnapshot: [String]
      }
    ],
     combo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComboService"
    },
    comboSnapshot: {
      name: String,
      originalPrice: Number,
      comboPrice: Number,
      imageSnapshot: [String]
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },

    endTime: {
      type: Date,
      required: true,
      index: true
    },

    duration: {
      type: Number, // minutes
      required: true
    },
    
   
    price: {
       original: Number,                 // tổng giá gốc
      afterServiceDiscount: Number,     // sau giảm service
      discountAmount: { type: Number, default: 0 }, // tiền giảm từ mã
      final: Number                     // giá cuối cùng khách trả
    }, 
    // giảm giá từ mã giảm giá
    discountCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountCard",
      default: null,
    },
    discount: {
      code: String,
      discountType: {
        type: String,
        enum: ["percent", "fixed"]
      },
      discountValue: Number,
      maxDiscountAmount: Number,
      discountAmount: {
        type: Number,
        default: 0
      }
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
      paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "cash"],
      default: "cash"
    },
      paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed","in_progress", "completed", "cancelled"],
      default: "pending",
      index: true
    },

    note: String,
    // thông báo giờ hẹn
    reminderSent: {
    type: Boolean,
    default: false,
    index: true
  }
  },
  { timestamps: true }
);
bookingSchema.index({
  staff: 1,
  startTime: 1,
  endTime: 1
});
bookingSchema.index({
  startTime: 1,
  endTime: 1
});

bookingSchema.index({
  staff: 1,
  startTime: 1
});

bookingSchema.index({
  customer: 1,
  startTime: 1
});
//  index cho cron job reminder
bookingSchema.index({
  startTime: 1,
  reminderSent: 1,
  status: 1
});
export default mongoose.model("Booking", bookingSchema);
