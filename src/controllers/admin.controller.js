import { StatusCodes } from "http-status-codes"
import {
  getServiceStatistics,
  getTopServices,
  getStaffList as getStaffListService,
  approveStaff as approveStaffService
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


const getStaffList = async (req, res, next) => {
  try {
    const onlyOnline = req.query.onlyOnline === 'true'
    const staffs = await getStaffListService({ onlyOnline })

    res.status(StatusCodes.OK).json({ data: staffs })
  } catch (err) {
    next(err)
  }
}

const approveStaff = async (req, res, next) => {
  try {
    const { userId } = req.params
    const adminId = req.user.id

    const result = await approveStaffService(userId, adminId)

    res.status(StatusCodes.OK).json({
      message: result.message
    })
  } catch (err) {
    next(err)
  }
}

export const AdminController = {
  getAdminDashboard,
  getStaffList,
  approveStaff,

}
