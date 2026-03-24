import Staff from '../models/Staff.model.js'
import Review from '../models/Review.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
export const createStaff = async (data) => {
  const {
    name,
    phone,
    email,
    experienceYears,
    skills,
    position,
    salary,
    note,
    avatar
  } = data

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu tên nhân viên")
  }

  const staff = await Staff.create({
    name,
    phone,
    email,
    experienceYears,
    skills,
    position,
    salary,
    note,
    avatar
  })

  return staff
}
export const updateStaff = async (staffId, data) => {
  const staff = await Staff.findById(staffId)

  if (!staff) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Staff không tồn tại")
  }

  Object.assign(staff, data)

  await staff.save()

  return staff
}
export const getStaffList = async () => {
  return Staff.find().sort({ createdAt: -1 })
}
export const getPublicStaffs = async () => {
    return Staff.find({workingStatus: 'active'})
        .select(
      "name slug avatar position experienceYears ratingAverage completedBookings workingStatus"
    )
        .sort({ ratingAverage: -1 })
}
export const deleteStaff = async (staffId) => {
  const staff = await Staff.findById(staffId)

  if (!staff) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Staff không tồn tại")
  }

  staff.workingStatus = "resigned"

  await staff.save()

  return staff
}

export const getStaffById = async (staffId) => {
    const staff = await Staff.findById(staffId)

    if (!staff) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Staff không tồn tại')
    }

    return staff
}
export const getStaffBySlug = async (slug) => {

  const staff = await Staff.findOne({ slug })

  if (!staff) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Staff không tồn tại")
  }

  return staff
}
export const getStaffReviews = async (staffId) => {
    if (Review.schema.path('staff')) {
        return Review.find({ staff: staffId, isDeleted: false })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
    }
    throw new ApiError(
        StatusCodes.NOT_IMPLEMENTED,
        'Chưa thể lấy review của nhân viên: Review không liên kết trực tiếp tới Staff trong schema'
    )
}
