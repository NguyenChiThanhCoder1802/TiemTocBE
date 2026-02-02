import { env } from "../config/environment.js";
import { vnpay } from "../config/vnpay.js";
import { dateFormat } from "vnpay/utils";

import Booking from "../models/Booking.model.js";
import Payment from "../models/Payment.model.js";

export const paymentService = {
  /* =====================================================
   * 1. TẠO URL THANH TOÁN BOOKING (VNPay)
   * ===================================================== */
  async createBookingPaymentUrl(req) {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      throw new Error("Thiếu bookingId");
    }

    // 1️⃣ Lấy booking
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: userId,
    });

    if (!booking) {
      throw new Error("Booking không tồn tại hoặc không thuộc về bạn");
    }

    if (booking.status !== "pending") {
      throw new Error("Booking không ở trạng thái chờ thanh toán");
    }

    const amount = booking.price?.final;
    if (!amount || amount <= 0) {
      throw new Error("Giá booking không hợp lệ");
    }

    // 2️⃣ Kiểm tra đã có payment pending chưa
    const existedPayment = await Payment.findOne({
      booking: booking._id,
      status: "pending",
    });

    if (existedPayment) {
      throw new Error("Booking này đang có giao dịch thanh toán chưa hoàn tất");
    }

    // 3️⃣ Tạo order / txnRef
    const txnRef = `BOOKING_${booking._id}_${Date.now()}`;
    const orderId = txnRef;

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "127.0.0.1";

    // 4️⃣ Build URL VNPay
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: env.VNP_RETURN_URL,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toán booking ${booking._id}`,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_CreateDate: dateFormat(new Date()),
    });

    // 5️⃣ Lưu Payment (pending)
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      orderId,
      txnRef,
      amount,
      method: "vnpay",
      provider: "vnpay",
      description: "Thanh toán đặt lịch dịch vụ",
      ipAddr,
      status: "pending",
    });
    booking.payment = payment._id;
    await booking.save();
    return {
      paymentUrl,
      orderId,
      txnRef,
      amount,
    };
  },

  /* =====================================================
   * 2. VNPay RETURN URL (User redirect về)
   * ===================================================== */
  async handleBookingReturnUrl(query) {
    console.log("=== VNPay Booking Return ===");
    console.log(JSON.stringify(query, null, 2));

    // 1️⃣ Verify checksum
    const verify = vnpay.verifyReturnUrl(query);

    const isPaymentSuccess =
      verify.isVerified && query.vnp_ResponseCode === "00";

    // 2️⃣ Lấy payment
    const payment = await Payment.findOne({
      txnRef: query.vnp_TxnRef,
    }).populate("booking");

    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    // 👉 Idempotent: đã xử lý rồi thì trả luôn
    if (payment.status !== "pending") {
     return {
      isSuccess: payment.status === "success",
      bookingId: payment.booking._id,
    };
    }

    // 3️⃣ Update payment
    payment.status = isSuccess ? "success" : "failed";
    payment.responseCode = query.vnp_ResponseCode;
    payment.transactionStatus = query.vnp_TransactionStatus;
    payment.bankCode = query.vnp_BankCode;
    payment.cardType = query.vnp_CardType;
    payment.vnpTxnNo = query.vnp_TransactionNo;
    payment.payDate = query.vnp_PayDate;
    payment.secureHash = query.vnp_SecureHash;
    payment.paidAt = isSuccess ? new Date() : null;

    await payment.save();

    // 4️⃣ Nếu thành công → confirm booking
    if (payment.booking && payment.booking.status === "pending") {
    if (isSuccess) {
      payment.booking.status = "confirmed";
      payment.booking.paymentStatus = "paid";
    } else {
      payment.booking.paymentStatus = "failed";
    }
    await payment.booking.save();
  }

   return {
    isSuccess,
    bookingId: payment.booking._id,
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
