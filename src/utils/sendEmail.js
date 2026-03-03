import transporter from "../config/mail.js";
import { env } from "../config/environment.js";
import fs from "fs";
import path from "path";
import mjml2html from "mjml";
import { fileURLToPath } from "url";
export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Hair Salon" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Xác thực đăng ký",
    html: `
      <h3>Mã OTP của bạn</h3>
      <h2>${otp}</h2>
      <p>Mã có hiệu lực trong 5 phút</p>
    `,
  });
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const sendBookingCompletedEmail = async ({
  email,
  customerName,
   totalAmount,
  bookingId,
  bookingType,
  staffName,
  serviceList,
  serviceCount,
  paymentMethod,
  startTime,
  endTime
}) => {
  const filePath = path.join(
    __dirname,
    "emailTemplates",
    "bookingCompleted.mjml"
  );
  let mjmlTemplate = fs.readFileSync(filePath, "utf8");
  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN");
  const paymentText =
    paymentMethod === "cash"
      ? "Thanh toán tại tiệm"
      : paymentMethod === "vnpay"
      ? "VNPay"
      : "MoMo"; 
   mjmlTemplate = mjmlTemplate
    .replace("{{customerName}}", customerName)
    .replace("{{totalAmount}}", totalAmount.toLocaleString())
    .replace("{{reviewUrl}}", `${env.FE_URL}/bookings/${bookingId}`)
    .replace("{{bookingType}}", bookingType === "combo" ? "Combo" : "Dịch vụ")
    .replace("{{staffName}}", staffName)
    .replace("{{serviceList}}", serviceList)
    .replace("{{serviceCount}}", serviceCount)
    .replace("{{paymentMethod}}", paymentText)
    .replace("{{startTime}}", formatDate(startTime))
    .replace("{{endTime}}", formatDate(endTime));

  const { html } = mjml2html(mjmlTemplate);

  await transporter.sendMail({
    from: `"Hair Salon" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Buổi làm tóc của bạn đã hoàn tất ✨",
    html
  });
};