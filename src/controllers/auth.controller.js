import { authService } from '../services/auth.service.js'
import { StatusCodes } from 'http-status-codes'

const register = async (req, res, next) => {
  try {
    await authService.registerService(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Đăng ký thành công'
    })
  } catch (err) {
    next(err)
  }
}


const login = async (req, res, next) => {
  try {
    const data = await authService.loginService(req.body)
    res.status(StatusCodes.OK).json({
      message: 'Đăng nhập thành công',
      data
    })
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    await authService.logoutService(req.user.id)
    res.json({ message: 'Đăng xuất thành công' })
  } catch (err) {
    next(err)
  }
}




const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPasswordService(req.body.email)
    res.json({ message: 'Đã gửi OTP đặt lại mật khẩu' })
  } catch (err) {
    next(err)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPasswordService(req.body)
    res.json({ message: 'Đổi mật khẩu thành công' })
  } catch (err) {
    next(err)
  }
}
const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsersService()
    res.json({ users })
  } catch (err) {
    next(err)
  }
}
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMeAccount(req.user.id)

    res.status(StatusCodes.OK).json({
      message: 'Lấy thông tin cá nhân thành công',
      data: user
    })
  } catch (error) {
    next(error)
  }
}


export const AuthController = {
  register,
  getAllUsers,
  getMe,
  login,
  logout,
  forgotPassword,
  resetPassword,
}
