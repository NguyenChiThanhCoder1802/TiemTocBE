export const validateCheckDiscount = (req, res, next) => {
  const { code, orderTotal } = req.body;

  if (!code || !orderTotal) {
    return res.status(400).json({
      message: "Thiếu mã giảm giá hoặc tổng tiền",
    });
  }

  next();
};
