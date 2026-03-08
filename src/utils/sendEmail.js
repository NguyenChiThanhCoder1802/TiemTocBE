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
export const sendBookingReminderEmail = async ({
  email,
  customerName,
  startTime,
  staffName
}) => {

  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN");

  await transporter.sendMail({
    from: `"Hair Salon" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Nhắc lịch hẹn làm tóc ",
    html: `
      <h3>Xin chào ${customerName}</h3>

      <p>Bạn có lịch hẹn tại salon với:</p>

      <b>${staffName}</b>

      <p>Thời gian:</p>

      <h2>${formatDate(startTime)}</h2>

      <p>Vui lòng đến đúng giờ để được phục vụ tốt nhất ✨</p>

      <p>Hair Salon</p>
    `
  });

};