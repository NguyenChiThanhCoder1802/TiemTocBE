  import Booking from "../models/Booking.model.js";
  import HairService from "../models/HairService.model.js";
  import ComboService from "../models/ComboService.model.js";
  import Staff from "../models/Staff.model.js";
  import { discountService } from "./discountCard.service.js";
  import {isServiceDiscountValid } from "../utils/discount.js";
  import Payment from "../models/Payment.model.js";
  import DiscountCard from "../models/DiscountCard.model.js";
  /* ================= CHECK STAFF ================= */
  export const isStaffBusy = async (staffId, start, end) => {
    return await Booking.exists({
      staff: staffId,
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });
  };
  export const validateBookingAvailability = async ({
    startTime,
    totalDuration,
    staffId
  }) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + totalDuration * 60000);

    // Nếu user chọn staff
    if (staffId) {
      const staffDoc = await Staff.findOne({
        _id: staffId,
        status: "approved",
        workingStatus: "active"
      });

      // Staff không tồn tại hoặc đã nghỉ
      if (!staffDoc) {
        return { available: false, suggestedStaff: null };
      }

      const busy = await isStaffBusy(staffId, start, end);

      return {
        available: !busy,
        suggestedStaff: !busy ? staffId : null
      };
    }

    // Auto assign staff
    const busyBookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).select("staff");

    const busyIds = busyBookings.map(b => b.staff);

    const availableStaff = await Staff.findOne({
      status: "approved",
      workingStatus: "active",
      _id: { $nin: busyIds }
    });

    return {
      available: !!availableStaff,
      suggestedStaff: availableStaff?._id || null
    };
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
          slugSnapshot: service.slug,
          originalPriceSnapshot: service.price,
          serviceDiscountPercent: isDiscountValid ? service.serviceDiscount.percent : 0,
          priceAfterServiceDiscount: priceAfterDiscount,
          durationSnapshot: service.duration,
          imageSnapshot: service.images
        });
      }
    }
    if (bookingType === "combo" && discountCode) {
      throw new Error("Combo không được áp dụng mã giảm giá");
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

  if (bookingType === "service" && discountCode) {
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

      const availability = await validateBookingAvailability({
        startTime,
        totalDuration,
        staffId: staff
      });

      if (!availability.available) {
        throw new Error("Không có nhân viên khả dụng trong thời gian này");
      }

      const assignedStaff = availability.suggestedStaff;
      /* ===== DOUBLE CHECK (ANTI RACE CONDITION) ===== */
      const finalBusyCheck = await isStaffBusy(
        assignedStaff,
        start,
        end
      );

      if (finalBusyCheck) {
        throw new Error(
          "Nhân viên vừa được đặt bởi người khác. Vui lòng thử lại."
        );
      }
    /* ===== CREATE BOOKING ===== */
    const booking = await Booking.create({
      customer: customerId,
      staff:assignedStaff,
      bookingType,
      services: bookingType === "service" ? servicesSnapshot : [],
      combo: bookingType === "combo" ? combo : null,
      comboSnapshot: bookingType === "combo" ? comboSnapshot : null,
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
    if (paymentMethod === "cash") {
      const payment = await Payment.create({
        booking: booking._id,
        user: customerId,
        txnRef: `CASH_${booking._id}_${Date.now()}`,
        amount: finalPrice,
        method: "cash",
        provider: null,
        description: `Thanh toán tiền mặt booking ${booking._id}`,
        status: "pending",
        paidAt: new Date()
      });

      booking.payment = payment._id;
      booking.paymentStatus = "unpaid";

      await booking.save();

      /* ===== UPDATE DISCOUNT ===== */
      if (booking.discountCard) {
        await DiscountCard.updateOne(
          {
            _id: booking.discountCard,
            isActive: true,
            isDeleted: false
          },
          {
            $inc: { usedQuantity: 1 },
            $push: {
              usedByUsers: {
                userId: customerId,
                usedCount: 1
              }
            }
          }
        );
      }
    }

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
        if (bookingType === "combo" && discountCode) {
  throw new Error("Combo không được áp dụng mã giảm giá");
}
    if (bookingType === "combo") {
     const comboDoc = await ComboService.findOne({
        _id: combo,
        isActive: true,
        isDeleted: false
      });
      const now = new Date();

if (comboDoc.activePeriod?.startAt && now < comboDoc.activePeriod.startAt)
  throw new Error("Combo chưa bắt đầu áp dụng");

if (comboDoc.activePeriod?.endAt && now > comboDoc.activePeriod.endAt)
  throw new Error("Combo đã hết hạn");
      if (!comboDoc) {
        throw new Error("Combo không tồn tại");
      }

      totalDuration = comboDoc.duration;
      originalPrice = comboDoc.pricing.originalPrice;
      afterServiceDiscount = comboDoc.pricing.comboPrice;
    }
    let discountAmount = 0;
    let finalPrice = afterServiceDiscount;

    if (bookingType === "service" && discountCode) {
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
        populate: { path: "user" ,select: "name"}
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