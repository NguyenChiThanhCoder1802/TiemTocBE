// services/staff.service.js
import Staff from '../models/Staff.model.js'
import Review from '../models/Review.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

export const getPublicStaffs = async () => {
    return Staff.find({workingStatus: 'active'})
        .select(
      "name avatar position experienceYears ratingAverage completedBookings workingStatus"
    )
        .sort({ ratingAverage: -1 })
}

export const getStaffById = async (staffId) => {
    const staff = await Staff.findById(staffId)

    if (!staff) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Staff không tồn tại')
    }

    return staff
}

export const getStaffReviews = async (staffId) => {
    // Reviews currently are linked to services (field `service`) and not directly to staff.
    // If the Review model contains a `staff` field, return reviews for that staff.
    if (Review.schema.path('staff')) {
        return Review.find({ staff: staffId, isDeleted: false })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
    }

    // Otherwise the relation doesn't exist in the current schema.
    throw new ApiError(
        StatusCodes.NOT_IMPLEMENTED,
        'Chưa thể lấy review của nhân viên: Review không liên kết trực tiếp tới Staff trong schema'
    )
}
