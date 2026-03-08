import HairService from "../models/HairService.model.js"
import Booking from "../models/Booking.model.js"
import Staff from '../models/Staff.model.js'
import User from '../models/User.model.js'
import Payment from "../models/Payment.model.js"
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

/* ================= ADMIN SERVICE ================= */

export const getServiceStatistics = async () => {
    const [
        totalServices,
        activeServices,
        discountedServices,
        comboServices,
        featuredServices,
    ] = await Promise.all([
        HairService.countDocuments({ isDeleted: false }),
        HairService.countDocuments({ isActive: true, isDeleted: false }),
        HairService.countDocuments({
            "serviceDiscount.isActive": true,
            isDeleted: false,
        }),
        HairService.countDocuments({ isCombo: true, isDeleted: false }),
        HairService.countDocuments({ isFeatured: true, isDeleted: false }),
    ])

    const aggregation = await HairService.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalBooking: { $sum: "$bookingCount" },
                totalView: { $sum: "$viewCount" },
                avgConversionRate: { $avg: "$conversionRate" },
                avgRating: { $avg: "$ratingAverage" },
            },
        },
    ])

    const summary = aggregation[0] || {
        totalBooking: 0,
        totalView: 0,
        avgConversionRate: 0,
        avgRating: 0,
    }

    return {
        overview: {
            totalServices,
            activeServices,
            discountedServices,
            comboServices,
            featuredServices,
        },
        performance: {
            totalBooking: summary.totalBooking,
            totalView: summary.totalView,
            avgConversionRate: Number(summary.avgConversionRate.toFixed(3)),
            avgRating: Number(summary.avgRating.toFixed(2)),
        },
    }
}

/* ================= TOP SERVICES ================= */

export const getTopServices = async () => {
    const topBooking = await HairService.find({ isDeleted: false })
        .sort({ bookingCount: -1 })
        .limit(5)
        .select("name bookingCount price finalPrice")

    const topView = await HairService.find({ isDeleted: false })
        .sort({ viewCount: -1 })
        .limit(5)
        .select("name viewCount")

    const topPopularity = await HairService.find({ isDeleted: false })
        .sort({ popularityScore: -1 })
        .limit(5)
        .select("name popularityScore")

    return {
        topBooking,
        topView,
        topPopularity,
    }
}
// Staff
export const createStaff = async (data) => {
  const {
    name,
    phone,
    email,
    experienceYears,
    skills,
    position,
    salary,
    note
  } = data

  if (!name)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu tên nhân viên")

  const staff = await Staff.create({
    name,
    phone,
    email,
    experienceYears,
    skills,
    position,
    salary,
    note
  })

  return staff
}
export const getStaffList = async () => {
    return await Staff.find().sort({ createdAt: -1 })
}

// Phần booking

export const getAllBookings = async ({ page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name email")
      .populate("staff", "name phone")
      .populate("payment"),

    Booking.countDocuments(query)
  ]);

  return {
    data: bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// duyệt booking
export const approveBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking không tồn tại");
  }
  if (booking.status === "cancelled") {
    throw new Error("Booking đã bị huỷ");
  }
  if (booking.status !== "pending") {
    throw new Error("Chỉ có thể duyệt booking đang ở trạng thái chờ");
  }

  booking.status = "confirmed";

  await booking.save();

  return booking;
};
// booking hoàn thành
export const completeBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
  .populate("customer", "name email")
  .populate("staff", "name")

  if (!booking)
    throw new Error("Booking không tồn tại");

  if (booking.status !== "confirmed")
    throw new Error("Chỉ có thể hoàn thành khi đã xác nhận");
  let serviceListHTML = "";

  if (booking.bookingType === "combo") {
    serviceListHTML = `• ${booking.comboSnapshot?.name || "Combo"}`;
  }
  booking.status = "completed";
  if (booking.paymentMethod === "cash") {
    booking.paymentStatus = "paid";

    await Payment.updateOne(
      { booking: booking._id },
      {
        status: "success",
        paidAt: new Date()
      }
    );
  }

  await booking.save();
  if (booking.bookingType === "service" && booking.services?.length > 0) {
    const serviceIds = booking.services.map(s => s.service);

    await HairService.updateMany(
      { _id: { $in: serviceIds } },
      { $inc: { bookingCount: 1 } }
    );
  }
 
  return booking;
};

// Tính doanh thu 
export const getRevenueStatistics = async () => {
  const [online, cash] = await Promise.all([
    // Online VNPay
    Payment.aggregate([
      {
        $match: {
          method: "vnpay",
          status: "success"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]),

    // Cash từ Booking
    Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          paymentMethod: "cash"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price.final" },
          totalOrders: { $sum: 1 }
        }
      }
    ])
  ])

  const onlineData = online[0] || { totalRevenue: 0, totalOrders: 0 }
  const cashData = cash[0] || { totalRevenue: 0, totalOrders: 0 }

  return {
    online: onlineData,
    cash: cashData,
    totalRevenue:
      onlineData.totalRevenue + cashData.totalRevenue,
    totalOrders:
      onlineData.totalOrders + cashData.totalOrders
  }
}
// Tính doanh thu theo 12 tháng
export const getOnlineRevenueByMonth = async (year) => {
  return await Payment.aggregate([
    {
      $match: {
        method: "vnpay",
        status: "success",
        paidAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$paidAt" } },
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { "_id.month": 1 } }
  ])
} 
// thống kế trạng thái thanh toán
export const getOnlinePaymentStats = async () => {
  return await Payment.aggregate([
    {
      $match: { method: "vnpay" }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ])
}