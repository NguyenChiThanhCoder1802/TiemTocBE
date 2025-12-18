import transporter from "../config/mail";
import { env } from "../config/environment.js";
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
