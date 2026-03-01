import Booking from "../models/Booking.model.js";
import HairService from "../models/HairService.model.js";
import ComboService from "../models/ComboService.model.js";
import Staff from "../models/Staff.model.js";
import { discountService } from "./discountCard.service.js";
import {isServiceDiscountValid } from "../utils/discount.js";
/* ================= CHECK STAFF ================= */
export const isStaffBusy = async (staffId, start, end) => {
  return await Booking.exists({
    staff: staffId,
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: end },
    endTime: { $gt: start }
  });
};
export const checkAllStaffAvailabilityService = async (
  startTime,
  duration
) => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);

  const staffs = await Staff.find({
    status: "approved",
    workingStatus: "active"
  });

  const availability = {};

  for (const staff of staffs) {
    const busy = await isStaffBusy(staff._id, start, end);
    availability[staff._id] = !busy;
  }

  return availability;
};
export const checkStaffAvailabilityService = async (
  staffId,
  startTime,
  duration
) => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);

  const busy = await isStaffBusy(staffId, start, end);

  return !busy;
};
export const findAvailableStaff = async (start, end) => {

  const busyBookings = await Booking.find({
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: end },
    endTime: { $gt: start }
  }).select("staff");

  const busyIds = new Set(
    busyBookings.map(b => b.staff.toString())
  );

  const staff = await Staff.findOne({
     status: "approved",          // đã được duyệt
    workingStatus: "active", // đang làm việc
    _id: { $nin: [...busyIds] }
  });

  return staff;
};
/* ================= CREATE CASH BOOKING ================= */
export const createBookingService = async (data, customerId, paymentMethod) => {
  const { staff, bookingType, services, combo, startTime, note, discountCode } = data;

  let totalDuration = 0;
  let originalPrice = 0;
  let afterServiceDiscount = 0;

  let servicesSnapshot = [];  
  let comboSnapshot = null;
  let discountDoc = null;
  let discountSnapshot = null;
  let discountAmount = 0;
  /* ===== SERVICE MODE ===== */
  if (bookingType === "service") {
    const ids = services.map(s => s.service);

    const serviceDocs = await HairService.find({
      _id: { $in: ids },
      isActive: true,
      isDeleted: false
    });

    if (serviceDocs.length !== ids.length)
      throw new Error("Có dịch vụ không hợp lệ");

    for (const service of serviceDocs) {
      totalDuration += service.duration;
      originalPrice += service.price;
      const isDiscountValid = isServiceDiscountValid(service.serviceDiscount); 
       const priceAfterDiscount = isDiscountValid
        ? Math.round(
            service.price *
              (1 - service.serviceDiscount.percent / 100)
          )
        : service.price;
         afterServiceDiscount += priceAfterDiscount;
      servicesSnapshot.push({
        service: service._id,
        nameSnapshot: service.name,
        originalPriceSnapshot: service.price,
        serviceDiscountPercent: isDiscountValid ? service.serviceDiscount.percent : 0,
        priceAfterServiceDiscount: priceAfterDiscount,
        durationSnapshot: service.duration,
        imageSnapshot: service.images
      });
    }
  }

  /* ===== COMBO MODE ===== */
  if (bookingType === "combo") {
    const comboDoc = await ComboService.findById(combo);

    if (!comboDoc)
      throw new Error("Combo không tồn tại");

    totalDuration = comboDoc.duration;
    originalPrice = comboDoc.pricing.originalPrice;
     afterServiceDiscount = comboDoc.pricing.comboPrice;

    comboSnapshot = {
      name: comboDoc.name,
      originalPrice,
      comboPrice: afterServiceDiscount,
      imageSnapshot: comboDoc.images || [],
    };
  }
  

  let finalPrice = afterServiceDiscount;

if (discountCode) {
  const discountResult =
    await discountService.applyDiscountToAmount({
      code: discountCode,
      amount: afterServiceDiscount,
      userId: customerId,
      serviceIds:
        bookingType === "service"
          ? servicesSnapshot.map(s =>
              s.service.toString()
            )
          : []
    });

  if (discountResult) {
    discountDoc = discountResult.discountDoc;
    discountSnapshot =
      discountResult.discountSnapshot;
    discountAmount =
      discountResult.discountAmount;
    finalPrice =
      discountResult.finalAmount;
  }
}
  /* ===== TIME ===== */
  const start = new Date(startTime);
  const end = new Date(start.getTime() + totalDuration * 60000);

  /* ===== CHECK STAFF ===== */
  let assignedStaff = staff;

// Nếu user không chọn staff → auto assign
if (!assignedStaff) {
  const availableStaff = await findAvailableStaff(start, end);

  if (!availableStaff) {
    throw new Error("Hiện tại không có nhân viên rảnh");
  }

  assignedStaff = availableStaff._id;
}

// Nếu có chọn staff → check lại
if (assignedStaff) {
  const busy = await isStaffBusy(assignedStaff, start, end);

  if (busy) {
    throw new Error("Staff đã có lịch trong thời gian này");
  }
}
  /* ===== CREATE BOOKING ===== */
  const booking = await Booking.create({
    customer: customerId,
    staff:assignedStaff,
    bookingType,
    services: servicesSnapshot,
    combo: bookingType === "combo" ? combo : null,
    comboSnapshot,
    startTime: start,
    endTime: end,
    duration: totalDuration,
    price: {
      original: originalPrice,
      afterServiceDiscount,
      discountAmount,
      final: finalPrice
    },
    discountCard: discountDoc?._id || null,
    discount: discountSnapshot,
    paymentMethod: paymentMethod,
    status: "pending",
    note
  });

  return booking;
};
export const previewBookingService = async (data, userId) => {
  const { bookingType, services, combo, discountCode } = data;
  let totalDuration = 0;
let originalPrice = 0;
  let afterServiceDiscount = 0;
  let serviceIds = [];
  
  if (bookingType === "service") {
    if (!services || services.length === 0) {
      throw new Error("Services are required");
    }

    
  // 🔹 convert về mảng id
  const ids = services.map(s => s.service);
    serviceIds = ids;
  const serviceDocs = await HairService.find({
    _id: { $in: ids },
    isActive: true,
    isDeleted: false
  });

  if (serviceDocs.length !== ids.length) {
    throw new Error("Some services not found");
  }

  

  for (const service of serviceDocs) {
    totalDuration += service.duration;
    originalPrice += service.price;

    const isDiscountValid = isServiceDiscountValid(service.serviceDiscount);

     const priceAfterDiscount = isDiscountValid
        ? Math.round(
            service.price *
            (1 - service.serviceDiscount.percent / 100)
          )
        : service.price;

        afterServiceDiscount += priceAfterDiscount;
      }
    }
      /* ===== COMBO MODE ===== */
  if (bookingType === "combo") {
    const comboDoc = await ComboService.findById(combo);

    if (!comboDoc) {
      throw new Error("Combo không tồn tại");
    }

    totalDuration = comboDoc.duration;
    originalPrice = comboDoc.pricing.originalPrice;
    afterServiceDiscount = comboDoc.pricing.comboPrice;
  }
  let discountAmount = 0;
  let finalPrice = afterServiceDiscount;

  if (discountCode) {
    const discountResult =
      await discountService.applyDiscountToAmount({
        code: discountCode,
        amount: afterServiceDiscount,
        userId,
        serviceIds
      });

    if (discountResult) {
      discountAmount = discountResult.discountAmount;
      finalPrice = discountResult.finalAmount;
    }
  }

  return {
    totalDuration,
    price: {
      original: originalPrice,
      afterServiceDiscount,
      discountAmount,
      final: finalPrice
    }
  };
};
export const getMyBookingsService = async (
  userId,
  page,
  limit,
  status
) => {
  const skip = (page - 1) * limit;
  const query = { customer: userId };

  if (status) {
    query.status = status;
  }
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("staff")
      .populate("combo")
      .populate({path: "payment", select: "method status provider" }),

    Booking.countDocuments(query)
  ]);

  return {
    data: bookings,
     pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
/* ================= GET BOOKING DETAIL ================= */
export const getBookingByIdService = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({ path: "customer", select: "name email avatar" })
    .populate({
      path: "staff",
      populate: { path: "user" }
    })
    .populate("combo")
    .populate({
      path: "services.service",
      model: "HairService"
    });

  if (!booking) {
    throw new Error("Booking không tồn tại");
  }

  return booking;
};
export const cancelBookingService = async (
  bookingId,
  userId
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customer: userId
  });

  if (!booking)
    throw new Error("Booking không tồn tại");

  if (booking.status === "cancelled")
    throw new Error("Booking đã bị hủy");

  booking.status = "cancelled";
  await booking.save();

  return booking;
};