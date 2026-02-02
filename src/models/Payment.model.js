import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    method: {
    type: String,
    enum: ["vnpay", "momo", "cash"],
    required: true,
    index: true,
    },
    provider: {
      type: String, // vnpay | momo
    },


    orderId: { type: String, required: true },
    txnRef: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    description: { type: String },

    // Info trả về từ VNPay
    bankCode: { type: String },
    cardType: { type: String },
    vnpTxnNo: { type: String },
    responseCode: { type: String },
    transactionStatus: { type: String },
    payDate: { type: String },

    secureHash: { type: String },
    ipAddr: { type: String },
    
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
