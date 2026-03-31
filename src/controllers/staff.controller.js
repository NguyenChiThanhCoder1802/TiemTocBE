import * as staffService from '../services/staff.service.js'

export const getPublicStaffs = async (req, res, next) => {
    try {
        const staffs = await staffService.getPublicStaffs()
        res.json({ data: staffs })
    } catch (err) {
        next(err)
    }
}

export const getStaffById = async (req, res, next) => {
    try {
        const { id } = req.params
        const staff = await staffService.getStaffById(id)
        res.json({ data: staff })
    } catch (err) {
        next(err)
    }
}

export const getStaffReviews = async (req, res, next) => {
    try {
        const { id } = req.params
        const reviews = await staffService.getStaffReviews(id)
        res.json({ data: reviews })
    } catch (err) {
        next(err)
    }
}
