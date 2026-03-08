import { StatusCodes } from "http-status-codes"
import {
  getServiceStatistics,
  getTopServices,
  createStaff as createStaffService,
  getStaffList as getStaffListService,
  getAllBookings as getAllBookingsService,
  approveBooking as approveBookingService,
  completeBooking as completeBookingService,
  getRevenueStatistics,
  getOnlineRevenueByMonth,
  getOnlinePaymentStats
} from "../services/admin.service.js"

const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await getServiceStatistics()
    const topServices = await getTopServices()

    res.status(StatusCodes.OK).json({
      message: "Admin service statistics fetched successfully",
      data: {
        ...stats,
        topServices
      }
    })
  } catch (error) {
    next(error)
  }
}

const createStaff = async (req, res, next) => {
  try {
    const staff = await createStaffService(req.body)

    res.status(StatusCodes.CREATED).json({
      message: "Tạo nhân viên thành công",
      data: staff
    })
  } catch (err) {
    next(err)
  }
}
const getStaffList = async (req, res, next) => {
  try {
   
    const staffs = await getStaffListService()

    res.status(StatusCodes.OK).json({ data: staffs })
  } catch (err) {
    next(err)
  }
}

// Booking
const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query

    const result = await getAllBookingsService({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status
    })

    res.status(StatusCodes.OK).json(result)
  } catch (err) {
    next(err)
  }
}
const approveBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params

    const booking = await approveBookingService(bookingId)

    res.status(StatusCodes.OK).json({
      message: "Duyệt booking thành công",
      data: booking
    })
  } catch (err) {
    next(err)
  }
}
const completeBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params

    const booking = await completeBookingService(bookingId)

    res.status(StatusCodes.OK).json({
      message: "Hoàn thành booking thành công",
      data: booking
    })
  } catch (err) {
    next(err)
  }
}

const getRevenueDashboard = async (req, res, next) => {
  try {
    const data = await getRevenueStatistics()

    res.status(StatusCodes.OK).json({
      message: "Revenue statistics fetched successfully",
      data
    })
  } catch (err) {
    next(err)
  }
}
const getOnlineRevenueByMonthController = async (req, res, next) => {
  try {
    const { year } = req.query

    const data = await getOnlineRevenueByMonth(year)

    res.status(StatusCodes.OK).json({ data })
  } catch (err) {
    next(err)
  }
}
const getOnlinePaymentStatsController = async (req, res, next) => {
  try {
    const data = await getOnlinePaymentStats()

    res.status(StatusCodes.OK).json({ data })
  } catch (err) {
    next(err)
  }
}
export const AdminController = {
  getAdminDashboard,
  createStaff,
  getStaffList,
  getAllBookings,
  approveBooking,
  completeBooking,
  getRevenueDashboard,
  getOnlineRevenueByMonthController,
  getOnlinePaymentStatsController

}
