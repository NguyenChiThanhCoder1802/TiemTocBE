export const validateCheckDiscount = (req, res, next) => {
  const { code, amount } = req.body;
  if (!code || !amount) {
    return res.status(400).json({
      message: "Thiếu mã giảm giá hoặc tổng tiền",
    });
  }

  next();
};
