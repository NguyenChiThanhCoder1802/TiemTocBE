import { StatusCodes } from "http-status-codes"
import {
  getServiceStatistics,
  getTopServices,

  getAllBookings as getAllBookingsService,
  approveBooking as approveBookingService,
  completeBooking as completeBookingService,
  getRevenueStatistics,
  getOnlineRevenueByMonth,
  getOnlinePaymentStats
} from "../services/admin.service.js"
import {
  createStaff,
  getStaffList,
  updateStaff,
  deleteStaff
} from "../services/staff.service.js"
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

const createStaffController = async (req, res, next) => {
  try {
    const staff = await createStaff(req.body)

    res.status(StatusCodes.CREATED).json({
      message: "Tạo nhân viên thành công",
      data: staff
    })
  } catch (err) {
    next(err)
  }
}
const updateStaffController = async (req, res, next) => {
  try {
    const { id } = req.params

    const staff = await updateStaff(id, req.body)

    res.status(StatusCodes.OK).json({
      message: "Cập nhật nhân viên thành công",
      data: staff
    })
  } catch (err) {
    next(err)
  }
}
const deleteStaffController = async (req, res, next) => {
  try {
    const { id } = req.params

    const staff = await deleteStaff(id)

    res.status(StatusCodes.OK).json({
      message: "Xóa nhân viên thành công",
      data: staff
    })
  } catch (err) {
    next(err)
  }
}
const getStaffListController = async (req, res, next) => {
  try {
   
    const staffs = await getStaffList()

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
 createStaff: createStaffController,
 updateStaff: updateStaffController,
  deleteStaff: deleteStaffController,
  getStaffList: getStaffListController,
  getAllBookings,
  approveBooking,
  completeBooking,
  getRevenueDashboard,
  getOnlineRevenueByMonthController,
  getOnlinePaymentStatsController

}
