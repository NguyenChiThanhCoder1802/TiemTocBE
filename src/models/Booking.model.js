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
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],
     combo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComboService"
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
      original: Number,
      final: Number
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentMethod: {
    type: String,
    enum: ["cash", "vnpay", "momo"],
    required: true,
    index: true
  },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true
    },

    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
