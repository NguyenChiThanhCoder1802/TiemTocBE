import jwt from 'jsonwebtoken'
import { env } from '../config/environment.js'
export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
  })
}

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
  })
}

export const jwtVerify = (token, isRefresh = false) => {
  return jwt.verify(
    token,
    isRefresh ? env.JWT_REFRESH_SECRET_KEY : env.JWT_SECRET_KEY
  )
}
