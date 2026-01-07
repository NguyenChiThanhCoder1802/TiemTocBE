export const isExpired = (discount) => {
  const now = new Date();
  return now < discount.startDate || now > discount.endDate;
};

export const isOutOfQuantity = (discount) => {
  return discount.usedQuantity >= discount.quantity;
};

export const calculateDiscountAmount = (
  orderTotal,
  discountType,
  discountValue,
  maxDiscountValue
) => {
  let discountAmount = 0;

  if (discountType === "percent") {
    discountAmount = (orderTotal * discountValue) / 100;
    if (maxDiscountValue) {
      discountAmount = Math.min(discountAmount, maxDiscountValue);
    }
  }

  if (discountType === "fixed") {
    discountAmount = discountValue;
  }

  return Math.min(discountAmount, orderTotal);
};
