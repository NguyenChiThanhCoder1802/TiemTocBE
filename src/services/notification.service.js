import Notification from "../models/Notification.model.js";

export const notificationService = {

  async createNotification(data) {
    return Notification.create(data);
  },

  async notifyBookingSuccess(userId, bookingId) {
    return Notification.create({
      user: userId,
      title: "Đặt lịch thành công",
      message: "Lịch đặt của bạn đã được tạo thành công.",
      type: "booking_success",
      booking: bookingId
    });
  },

  async notifyPaymentSuccess(userId, bookingId, paymentId) {
    return Notification.create({
      user: userId,
      title: "Thanh toán thành công",
      message: "Thanh toán VNPay cho lịch đặt đã thành công.",
      type: "payment_success",
      booking: bookingId,
      payment: paymentId
    });
  },

  async notifyReviewRequest(userId, bookingId) {
    return Notification.create({
      user: userId,
      title: "Hãy đánh giá dịch vụ",
      message: "Lịch đặt của bạn đã hoàn thành. Hãy để lại đánh giá.",
      type: "review_request",
      booking: bookingId
    });
  },

  async getUserNotifications(userId, page = 1, limit = 10) {

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title message booking isRead createdAt")
       .populate({
          path: "booking",
          select: "_id services.nameSnapshot services.imageSnapshot"
        })
        .populate("payment"),

      Notification.countDocuments({ user: userId })
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }
};