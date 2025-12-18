import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import otpCache from '../utils/otp.js'
import { generateOtp } from '../utils/generateOtp.js'
import { sendOtpEmail } from '../utils/sendEmail.js'
import {
  signAccessToken,
  signRefreshToken
} from '../utils/jwt.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

export const registerService = async ({ name, email, password }) => {
  const existed = await User.findOne({ email })
  if (existed)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại')

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false
  })

  const otp = generateOtp()
  otpCache.set(email, otp)

  await sendOtpEmail(email, otp)
}
export const verifyOtpService = async ({ email, otp }) => {
  const cachedOtp = otpCache.get(email)
  if (!cachedOtp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP đã hết hạn')

  if (cachedOtp !== otp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP không đúng')

  await User.findOneAndUpdate(
    { email },
    { isVerified: true }
  )

  otpCache.del(email)
}

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email })
  if (!user)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sai email hoặc mật khẩu')

  if (!user.isVerified)
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chưa xác thực email')

  const match = await bcrypt.compare(password, user.password)
  if (!match)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sai email hoặc mật khẩu')

  const payload = { id: user._id, role: user.role }

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  }
}
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email })
  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')

  const otp = generateOtp()
  otpCache.set(`reset_${email}`, otp)

  await sendOtpEmail(email, otp)
}

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const cachedOtp = otpCache.get(`reset_${email}`)
  if (!cachedOtp || cachedOtp !== otp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP không hợp lệ')

  const hashed = await bcrypt.hash(newPassword, 10)

  await User.findOneAndUpdate(
    { email },
    { password: hashed }
  )

  otpCache.del(`reset_${email}`)
}
