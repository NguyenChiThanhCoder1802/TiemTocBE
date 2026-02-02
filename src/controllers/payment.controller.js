import { paymentService } from "../services/payment.service.js";
import { env } from "../config/environment.js";
/* =====================================================
 * TẠO URL THANH TOÁN BOOKING (USER)
 * POST /api/payments/booking/vnpay
 * ===================================================== */
export const createBookingPayment = async (req, res) => {
  try {
    const result = await paymentService.createBookingPaymentUrl(req);

    return res.status(200).json({
      data: {
    paymentUrl: result.paymentUrl,
    orderId: result.orderId,
    txnRef: result.txnRef,
  }
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Không thể tạo thanh toán",
    });
  }
};

/* =====================================================
 * VNPAY RETURN URL
 * GET /api/payments/booking/vnpay-return
 * ===================================================== */
export const handleBookingVnpayReturn = async (req, res) => {
  try {
    const result = await paymentService.handleBookingReturnUrl(req.query);

    return res.redirect(
      `${env.FE_URL}/payment-result?status=${
        result.isSuccess ? "success" : "failed"
      }&bookingId=${result.bookingId}`
    );
  } catch (error) {
    return res.redirect(
      `${env.FE_URL}/payment-result?status=error`
    );
  }
};


/* =====================================================
 * USER XEM LỊCH SỬ THANH TOÁN BOOKING
 * GET /api/payments/my
 * ===================================================== */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await paymentService.getMyBookingPayments(req.user.id);

    return res.status(200).json({
      data: payments,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Không lấy được lịch sử thanh toán",
    });
  }
};

/* =====================================================
 * ADMIN – THỐNG KÊ DOANH THU BOOKING
 * GET /api/payments/admin/revenue
 * ===================================================== */
export const getBookingRevenue = async (req, res) => {
  try {
    const { from, to } = req.query;

    const revenue = await paymentService.getBookingRevenue({ from, to });

    return res.status(200).json({
      data: revenue,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Không lấy được doanh thu",
    });
  }
};
