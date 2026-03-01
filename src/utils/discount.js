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
// Kiểm tra nếu discount có áp dụng cho dịch vụ cụ thể
export const isServiceDiscountValid = (serviceDiscount) => {
  if (!serviceDiscount) return false;

  const { percent, startAt, endAt } = serviceDiscount;

  if (!percent || percent <= 0) return false;

  const now = new Date();
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;

  if (start && start > now) return false;
  if (end && end < now) return false;
  return true;
};