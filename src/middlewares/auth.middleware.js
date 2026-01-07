import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { jwtVerify, signAccessToken } from '../utils/jwt.js'


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
  const refreshToken = req.headers['x-refresh-token']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Chưa đăng nhập')
    )
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    const decoded = jwtVerify(accessToken)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      if (!refreshToken) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            'REFRESH_TOKEN_NOT_PROVIDED'
          )
        )
      }

      try {
        const decoded = jwtVerify(refreshToken, true)

        const payload = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }

        const newAccessToken = signAccessToken(payload)
        res.setHeader('X-New-Access-Token', newAccessToken)
        req.user = decoded
        next()
      } catch (refreshErr) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            'REFRESH_TOKEN_EXPIRED_OR_INVALID'
          )
        )
      }
    } else {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'INVALID_ACCESS_TOKEN'
        )
      )
    }
  }
}
