import HairService from "../models/HairService.model.js"
import Staff from '../models/Staff.model.js'
import User from '../models/User.model.js'
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

export const getStaffList = async ({ onlyOnline = false } = {}) => {
    if (onlyOnline) {
        const staffs = await Staff.find()
            .populate({ path: 'user', match: { isOnline: true }, select: 'name email isOnline role status' })
        
        return staffs.filter(s => s.user)
    }

    const staffs = await Staff.find().populate('user', 'name email isOnline role status')
    return staffs
}

export const approveStaff = async (userId, adminId) => {
  const user = await User.findById(userId)
  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')

  const staff = await Staff.findOne({ user: user._id })
  if (!staff)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Người dùng chưa đăng ký làm nhân viên'
    )

  if (staff.status !== 'pending')
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Nhân viên không ở trạng thái chờ duyệt'
    )

  // ✅ cập nhật staff
  staff.status = 'approved'
  staff.manager = adminId
  staff.joinedAt = staff.joinedAt || new Date()
  await staff.save()

  // ✅ cập nhật user
  user.role = 'staff'
  user.staffRequested = false
  user.staffRequestedAt = undefined
  await user.save()

  return { message: 'Duyệt nhân viên thành công' }
}
