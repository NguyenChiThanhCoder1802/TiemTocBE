import jwt from 'jsonwebtoken'
import { env } from '../config/environment.js'
export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    expiresIn: '15m'
  })
}

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: '7d'
  })
}

export const jwtVerify = (token, isRefresh = false) => {
  return jwt.verify(
    token,
    isRefresh ? env.JWT_REFRESH_SECRET_KEY : env.JWT_SECRET_KEY
  )
}
