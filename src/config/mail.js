import nodemailer from "nodemailer";
import { env } from "../config/environment.js";
const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});
export default transporter;
