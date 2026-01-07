export const applyServiceDiscount = (service) => {
  const now = new Date();

  const obj = service.toObject
    ? service.toObject()
    : { ...service };

  const discount = obj.serviceDiscount;

  if (
    discount?.percent > 0 &&
    discount.startAt &&
    discount.endAt &&
    now >= new Date(discount.startAt) &&
    now <= new Date(discount.endAt)
  ) {
    return {
      ...obj,
      finalPrice:
        obj.price - (obj.price * discount.percent) / 100,
      serviceDiscount: {
        ...discount,
        isActive: true,
      },
    };
  }

  return {
    ...obj,
    finalPrice: obj.price,
    serviceDiscount: {
      ...discount,
      isActive: false,
    },
  };
};
