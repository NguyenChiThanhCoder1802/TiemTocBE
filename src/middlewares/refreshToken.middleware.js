import { verifyToken, signAccessToken } from '../utils/jwt.js'

export const autoRefreshToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1]

  if (!accessToken) return next()

  try {
    verifyToken(accessToken)
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const refreshToken = req.headers['x-refresh-token']
      if (!refreshToken) return next(err)

      const decoded = verifyToken(refreshToken, true)
      const newAccessToken = signAccessToken({
        id: decoded.id,
        role: decoded.role
      })

      res.setHeader('x-access-token', newAccessToken)
      req.user = decoded
      next()
    } else {
      next(err)
    }
  }
}
