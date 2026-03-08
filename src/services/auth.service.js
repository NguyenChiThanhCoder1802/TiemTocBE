import bcrypt from 'bcryptjs'
import User from '../models/User.model.js' 
import { signAccessToken, signRefreshToken } from '../utils/jwt.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const normalizeEmail = (email) => email.toLowerCase().trim()

const registerService = async ({ name, email, password, confirmpassword }) => {
  if (!name || !email || !password || !confirmpassword)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin đăng ký')

  const emailNormalized = normalizeEmail(email)

  const existed = await User.findOne({ email: emailNormalized })
  if (existed)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại')

  const hashedPassword = await bcrypt.hash(password, 10)

   const user = await User.create({
    name,
    email: emailNormalized,
    password: hashedPassword,
    isVerified: true
  })
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}


const loginService = async ({ email, password }) => {
  if (!email || !password)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu email hoặc mật khẩu')

  const emailNormalized = normalizeEmail(email)
  const user = await User.findOne({ email: emailNormalized })

  if (!user)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sai email hoặc mật khẩu')

  if (!user.isVerified)
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chưa xác thực email')

  const match = await bcrypt.compare(password, user.password)
  if (!match)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sai email hoặc mật khẩu')

  user.stats = user.stats || {}
  user.stats.lastActiveAt = new Date()
  await user.save()

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  }

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }
}

const logoutService = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  await user.save()
}

const forgotPasswordService = async (email) => {
  if (!email)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu email')

  const emailNormalized = normalizeEmail(email)
  
  const user = await User.findOne({ email: emailNormalized })

  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')

  return {
    message: 'Email hợp lệ, tiếp tục đặt lại mật khẩu'
  }
}

const resetPasswordService = async ({ email, newPassword }) => {
  if (!email || !newPassword)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin')

  const emailNormalized = normalizeEmail(email)
 
  const user = await User.findOne({ email: emailNormalized })
    if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  user.password = hashedPassword
  await user.save()
   return {
    message: 'Đặt lại mật khẩu thành công'
  }
}

const getAllUsersService = async () => {
  const users = await User.find().select('-password')
  return users
}
const getMeAccount = async (userId) => {
  const user = await User.findById(userId, {
    password: 0,
    __v: 0
  })

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  }

  return user
}
export const authService = {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getAllUsersService,
  getMeAccount,
  logoutService
}
