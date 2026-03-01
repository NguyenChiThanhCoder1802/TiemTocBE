import { StatusCodes } from "http-status-codes";
import  {discountService} from "../services/discountCard.service.js";

 const applyDiscount = async (req, res, next) => {
  try {
    const result = await discountService.applyDiscountToAmount({
      ...req.body,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};


 const createDiscount = async (req, res, next) => {
  try {
    const discount = await discountService.createDiscount(req.body);
    res.status(StatusCodes.CREATED).json(discount);
  } catch (error) {
    next(error);
  }
};


 const updateDiscount = async (req, res, next) => {
  try {
    const discount = await discountService.updateDiscount(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json(discount);
  } catch (error) {
    next(error);
  }
};


 const deleteDiscount = async (req, res, next) => {
  try {
    await discountService.deleteDiscount(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error) {
    next(error);
  }
};


 const getAllDiscounts = async (req, res, next) => {
  try {
    const discounts = await discountService.getAllDiscounts();
    res.status(StatusCodes.OK).json(discounts);
  } catch (error) {
    next(error);
  }
};
export const DiscountCardController = {
  applyDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllDiscounts,
};