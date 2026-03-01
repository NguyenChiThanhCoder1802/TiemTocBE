import { env } from "../config/environment.js";
import { vnpay } from "../config/vnpay.js";
import Booking from "../models/Booking.model.js";
import Payment from "../models/Payment.model.js";
import DiscountCard from "../models/DiscountCard.model.js";
import { ProductCode, VnpLocale } from "vnpay";

export const paymentService = {
  async createBookingPaymentUrl(req) {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) throw new Error("Thiếu bookingId");

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: userId,
    });

    if (!booking)
      throw new Error("Booking không tồn tại hoặc không thuộc về bạn");

    if (booking.status !== "pending")
      throw new Error("Booking không ở trạng thái chờ thanh toán");
    if (booking.paymentStatus === "paid")
   throw new Error("Booking đã thanh toán");
    const amount = booking.price?.final;
    if (!amount || amount <= 0)
      throw new Error("Giá booking không hợp lệ");

    const existedPayment = await Payment.findOne({
      booking: booking._id,
      status: "pending",
    });

    if (existedPayment)
      throw new Error("Đã có giao dịch thanh toán chưa hoàn tất");

    const txnRef = `BOOKING_${booking._id}_${Date.now()}`;
    const orderId = txnRef;

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: env.VNP_RETURN_URL,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan booking ${booking._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
    });

   const newPayment = await Payment.create({
      booking: booking._id,
      user: userId,
      orderId,
      txnRef,
      amount,
      method: "vnpay",
      provider: "vnpay",
      description: `Thanh toán booking ${booking._id}`,
      ipAddr,
      status: "pending",
    });
    booking.payment = newPayment._id;
    booking.paymentMethod = "vnpay";
    await booking.save();
    return { paymentUrl, orderId };
  },

   async handleBookingReturnUrl(query) {
    console.log("=== VNPay Booking Return ===");
    console.log("Raw query:", JSON.stringify(query, null, 2));

    let verify;
    try {
      verify = vnpay.verifyReturnUrl(query);
    } catch (error) {
      throw new Error("Dữ liệu trả về không hợp lệ");
    }

    console.log("Verify result:", verify);

    const isPaymentSuccess =
      verify.isVerified && query.vnp_ResponseCode === "00";

    const { vnp_TxnRef } = query;

    const payment = await Payment.findOne({
      txnRef: vnp_TxnRef,
    }).populate("booking");

    if (!payment)
      throw new Error("Không tìm thấy payment trong hệ thống");

    if (payment.status !== "pending") {
      return {
        isSuccess: payment.status === "success",
        bookingId: payment.booking?._id,
      };
    }

    payment.status = isPaymentSuccess ? "success" : "failed";
    payment.responseCode = query.vnp_ResponseCode;
    payment.transactionStatus = query.vnp_TransactionStatus;
    payment.bankCode = query.vnp_BankCode;
    payment.cardType = query.vnp_CardType;
    payment.vnpTxnNo = query.vnp_TransactionNo;
    payment.payDate = query.vnp_PayDate;
    payment.secureHash = query.vnp_SecureHash;
    payment.paidAt = isPaymentSuccess ? new Date() : null;

    await payment.save();

    // Nếu thanh toán thành công → confirm booking
    if (payment.booking) {
  if (isPaymentSuccess) {
    payment.booking.status = "confirmed";
    payment.booking.paymentStatus = "paid";

    /* ===== UPDATE DISCOUNT ATOMIC ===== */
    if (payment.booking.discountCard) {
      const discountId = payment.booking.discountCard;

      await DiscountCard.updateOne(
        {
          _id: discountId,
          isActive: true,
          isDeleted: false
        },
        {
          $inc: { usedQuantity: 1 },
          $push: {
            usedByUsers: {
              userId: payment.user,
              usedCount: 1
            }
          }
        }
      );
    }

  } else {
    payment.booking.paymentStatus = "failed";
  }

  await payment.booking.save();
}

    return {
      isSuccess: isPaymentSuccess,
      isVerified: verify.isVerified,
      message: verify.message,
      bookingId: payment.booking?._id,
    };
  },

  /* =====================================================
   * 3. USER – XEM LỊCH SỬ THANH TOÁN
   * ===================================================== */
  async getMyBookingPayments(userId) {
    return Payment.find({ user: userId })
      .populate({
        path: "booking",
        populate: [
          { path: "staff" },
          { path: "services.service" },
          { path: "combo" },
        ],
      })
      .sort({ createdAt: -1 });
  },

  /* =====================================================
   * 4. ADMIN – DOANH THU BOOKING
   * ===================================================== */
  async getBookingRevenue({ from, to }) {
    const match = { status: "success" };

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const revenue = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    return revenue[0] || { totalRevenue: 0, totalOrders: 0 };
  },
};
