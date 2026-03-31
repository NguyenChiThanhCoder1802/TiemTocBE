import express from 'express'
import * as StaffController from '../controllers/staff.controller.js'

const Router = express.Router()

// Public list
Router.get('/', StaffController.getPublicStaffs)
// Public staff detail
Router.get('/:id', StaffController.getStaffById)
// Public staff reviews (only if Review schema links to staff)
Router.get('/:id/reviews', StaffController.getStaffReviews)

export const staffRouter = Router
