import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { jwtVerify } from '../utils/jwt.js'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token)
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token không được cung cấp'))

  try {
    req.user = jwtVerify(token)
    next()
  } catch (err) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc đã hết hạn'))
  }
}

export const verifyRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập')
      )
    }
    next()
  }
}
