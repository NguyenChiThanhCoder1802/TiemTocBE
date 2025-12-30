import rateLimit from "express-rate-limit";

export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 phút

export const RATE_LIMIT_MESSAGES = {
  DEFAULT: "Quá nhiều yêu cầu từ địa chỉ này, vui lòng thử lại sau.",
  LOGIN:
    "Quá nhiều lần đăng nhập từ địa chỉ này, vui lòng thử lại sau 15 phút",
  REGISTER: 
  "Quá nhiều lần đăng ký từ địa chỉ này, vui lòng thử lại sau 15 phút",
  OTP:
    "Quá nhiều yêu cầu OTP từ địa chỉ này, vui lòng thử lại sau 15 phút",
  RESET_PASSWORD:
    "Quá nhiều yêu cầu đặt lại mật khẩu từ địa chỉ này, vui lòng thử lại sau 15 phút",
  GET_ALLHAIRSALON:
    "Quá nhiều yêu cầu lấy danh sách dịch vụ từ địa chỉ này, vui lòng thử lại sau 15 phút",
  GET_HAIRSALON_ID:
    "Quá nhiều yêu cầu lấy dịch vụ từ địa chỉ này, vui lòng thử lại sau 15 phút",
  POST_HAIRSALON:
    "Quá nhiều yêu cầu tạo dịch vụ từ địa chỉ này, vui lòng thử lại sau 15 phút",
  PUT_HAIRSALON:
    "Quá nhiều yêu cầu cập nhật dịch vụ từ địa chỉ này, vui lòng thử lại sau 15 phút",
  DELETE_HAIRSALON:
    "Quá nhiều yêu cầu xóa dịch vụ từ địa chỉ này, vui lòng thử lại sau 15 phút",
};

const createLimitMiddleware = ({
  max,
  message = RATE_LIMIT_MESSAGES.DEFAULT,
  windowMs = RATE_LIMIT_WINDOW,
}) =>
  rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });

export default createLimitMiddleware;
 const limitMiddleware = createLimitMiddleware({
  max: 100,
});

 const loginLimitMiddleware = createLimitMiddleware({
  max: 10,
  message: RATE_LIMIT_MESSAGES.LOGIN,
});
  const registerLimitMiddleware = createLimitMiddleware({
  max: 10,
  message: RATE_LIMIT_MESSAGES.REGISTER,
});

 const otpLimitMiddleware = createLimitMiddleware({
  max: 5,
  message: RATE_LIMIT_MESSAGES.OTP,
});
 const resetPasswordLimitMiddleware = createLimitMiddleware({
  max: 5,
  message: RATE_LIMIT_MESSAGES.RESET_PASSWORD,
});
 const getHairServicesLimitMiddleware = createLimitMiddleware({
  max: 10,
  message: RATE_LIMIT_MESSAGES.GET_ALLHAIRSALON,
});
const getHairServiceByIdLimitMiddleware = createLimitMiddleware({
  max: 10,
  message: RATE_LIMIT_MESSAGES.GET_HAIRSALON_ID,
});
const postHairServiceLimitMiddleware = createLimitMiddleware({
  max: 5,
  message: RATE_LIMIT_MESSAGES.POST_HAIRSALON,
});
const putHairServiceLimitMiddleware = createLimitMiddleware({
  max: 5,
  message: RATE_LIMIT_MESSAGES.PUT_HAIRSALON,
});
const deleteHairServiceLimitMiddleware = createLimitMiddleware({
  max: 5,
  message: RATE_LIMIT_MESSAGES.DELETE_HAIRSALON,
});
export const limit ={
    limitMiddleware,
    loginLimitMiddleware,
    otpLimitMiddleware,
    resetPasswordLimitMiddleware,getHairServicesLimitMiddleware,
    getHairServiceByIdLimitMiddleware,
    registerLimitMiddleware,
    postHairServiceLimitMiddleware,
    putHairServiceLimitMiddleware,
    deleteHairServiceLimitMiddleware
}

