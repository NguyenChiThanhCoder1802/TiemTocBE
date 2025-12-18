import 'dotenv/config'
export const env = {
  MONGODB_URL: process.env.MONGODB_URL,
  DATABASE_NAME: process.env.DATABASE_NAME,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  BUILD_MODE: process.env.BUILD_MODE,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}
