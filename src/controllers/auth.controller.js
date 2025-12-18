import * as authService from '../services/auth.service.js'
import { StatusCodes } from 'http-status-codes'

export const register = async (req, res, next) => {
  try {
    await authService.registerService(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Đã gửi OTP về email'
    })
  } catch (err) {
    next(err)
  }
}

export const verifyOtp = async (req, res, next) => {
  try {
    await authService.verifyOtpService(req.body)
    res.json({ message: 'Xác thực thành công' })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const data = await authService.loginService(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPasswordService(req.body.email)
    res.json({ message: 'Đã gửi OTP đặt lại mật khẩu' })
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPasswordService(req.body)
    res.json({ message: 'Đổi mật khẩu thành công' })
  } catch (err) {
    next(err)
  }
}

export const logout = async (req, res) => {
  res.json({ message: 'Logout thành công (FE xoá token)' })
}
