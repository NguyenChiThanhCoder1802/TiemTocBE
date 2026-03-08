import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "booking_success",
        "payment_success",
        "booking_completed",
        "review_request"
      ],
      required: true,
      index: true
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);