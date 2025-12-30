import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import otpCache from '../utils/otp.js'
import { generateOtp } from '../utils/generateOtp.js'
import { sendOtpEmail } from '../utils/sendEmail.js'
import { signAccessToken, signRefreshToken, jwtVerify } from '../utils/jwt.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const normalizeEmail = (email) => email.toLowerCase().trim()

const registerService = async ({ name, email, password, confirmpassword }) => {
  if (!name || !email || !password || !confirmpassword)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin đăng ký')

  if (password !== confirmpassword)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Mật khẩu không khớp')

  const emailNormalized = normalizeEmail(email)

  if (otpCache.get(emailNormalized))
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Vui lòng chờ OTP cũ hết hạn'
    )

  const existed = await User.findOne({ email: emailNormalized })
  if (existed)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại')

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({
    name,
    email: emailNormalized,
    password: hashedPassword,
    isVerified: false
  })

  const otp = generateOtp()
  const hashedOtp = await bcrypt.hash(otp, 10)
  otpCache.set(emailNormalized, hashedOtp)

  await sendOtpEmail(emailNormalized, otp)
}

const verifyOtpService = async ({ email, otp }) => {
  if (!email || !otp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu email hoặc OTP')

  const emailNormalized = normalizeEmail(email)
  const cachedOtp = otpCache.get(emailNormalized)

  if (!cachedOtp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP đã hết hạn')

  const isValid = await bcrypt.compare(otp, cachedOtp)
  if (!isValid)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP không đúng')

  const user = await User.findOne({ email: emailNormalized })
  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')

  user.isVerified = true
  await user.save()

  otpCache.del(emailNormalized)
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

const forgotPasswordService = async (email) => {
  if (!email)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu email')

  const emailNormalized = normalizeEmail(email)
  const user = await User.findOne({ email: emailNormalized })

  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')

  if (otpCache.get(`reset_${emailNormalized}`))
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Vui lòng chờ OTP cũ hết hạn'
    )

  const otp = generateOtp()
  const hashedOtp = await bcrypt.hash(otp, 10)
  otpCache.set(`reset_${emailNormalized}`, hashedOtp)

  await sendOtpEmail(emailNormalized, otp)
}

const resetPasswordService = async ({ email, otp, newPassword }) => {
  if (!email || !otp || !newPassword)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin')

  const emailNormalized = normalizeEmail(email)
  const cachedOtp = otpCache.get(`reset_${emailNormalized}`)

  if (!cachedOtp)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP đã hết hạn')

  const isValid = await bcrypt.compare(otp, cachedOtp)
  if (!isValid)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP không hợp lệ')

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await User.findOneAndUpdate(
    { email: emailNormalized },
    { password: hashedPassword }
  )

  otpCache.del(`reset_${emailNormalized}`)
}
const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Refresh token không được cung cấp'
    )
  }

  // Verify refresh token
  const decoded = jwtVerify(refreshToken, true)

  const payload = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role
  }

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload) // rotate
  }
}
const getAllUsersService = async () => {
  const users = await User.find().select('-password')
  return users
}
const getMeAccount = async (userId)=>{
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
  verifyOtpService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  refreshTokenService,
  getAllUsersService,
  getMeAccount
}
