import express from 'express'
import * as StaffController from '../controllers/staff.controller.js'

const Router = express.Router()

Router.get('/', StaffController.getPublicStaffs)
Router.get('/:slug/reviews', StaffController.getStaffReviews)
Router.get('/:slug', StaffController.getStaffBySlug)


export const staffRouter = Router
