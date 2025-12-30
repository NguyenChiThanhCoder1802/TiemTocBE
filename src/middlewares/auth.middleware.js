import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { jwtVerify } from '../utils/jwt.js'


export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(  
      new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập')
    )
  }
  next()
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
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Chưa đăng nhập')
    )
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwtVerify(token)
    req.user = decoded 
  

    next()
  } catch {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc đã hết hạn')
    )
  }
}
