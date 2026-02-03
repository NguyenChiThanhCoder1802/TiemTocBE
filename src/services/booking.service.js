import Booking from "../models/Booking.model.js";
import Staff from "../models/Staff.model.js";
import HairService from "../models/HairService.model.js";
import ComboService from "../models/ComboService.model.js";

/* ================== HELPER ================== */
// kiểm tra nhân viên có bận trong khung giờ không
const isStaffBusy = async (staffId, startTime, endTime) => {
  const conflict = await Booking.findOne({
    staff: staffId,
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
  return !!conflict;
};

/* ================== CREATE BOOKING ================== */
export const createBookingService = async ({
  customer,
  bookingType,
  services,
  combo,
  staff,
  startTime,
  note,
  paymentMethod
}) => {
  if (!startTime || isNaN(new Date(startTime))) {
    throw new Error("Thời gian đặt lịch không hợp lệ");
  }

  let duration = 0;
  let price = { original: 0, final: 0 };

  /* ====== TÍNH DURATION + PRICE ====== */
  if (bookingType === "service") {
    if (!services || services.length === 0) {
      throw new Error("Vui lòng chọn ít nhất 1 dịch vụ");
    }

    const serviceIds = services.map(s => s.service);
    const serviceDocs = await HairService.find({
      _id: { $in: serviceIds }
    });

    if (serviceDocs.length !== serviceIds.length) {
      throw new Error("Một hoặc nhiều dịch vụ không tồn tại");
    }

    serviceDocs.forEach(s => {
      duration += s.duration;
      price.original += s.price;
      price.final += s.finalPrice ?? s.price;
    });
  } else if (bookingType === "combo") {
    if (!combo) {
      throw new Error("Vui lòng chọn combo");
    }

    const comboDoc = await ComboService.findById(combo);
    if (!comboDoc) {
      throw new Error("Combo không tồn tại");
    }

    duration = comboDoc.duration;
    price.original = comboDoc.pricing.originalPrice;
    price.final = comboDoc.pricing.comboPrice;
  } else {
    throw new Error("Loại booking không hợp lệ");
  }

  const endTime = new Date(
    new Date(startTime).getTime() + duration * 60000
  );

  /* ====== CHỌN NHÂN VIÊN ====== */
  let selectedStaff;

  if (staff) {
    const busy = await isStaffBusy(staff, startTime, endTime);
    if (busy) {
      throw new Error("Nhân viên đang bận trong khung giờ này");
    }
    selectedStaff = staff;
  } else {
    const staffs = await Staff.find({
      status: "approved",
      workingStatus: "active",
      position: "stylist"
    });

    const available = (
      await Promise.all(
        staffs.map(async s => {
          const busy = await isStaffBusy(s._id, startTime, endTime);
          return busy ? null : s;
        })
      )
    ).filter(Boolean);

    if (available.length === 0) {
      throw new Error("Không có nhân viên rảnh, vui lòng chọn giờ khác");
    }

    // ưu tiên: ít booking → rating cao → nhiều kinh nghiệm
    available.sort(
      (a, b) =>
        a.completedBookings - b.completedBookings ||
        b.ratingAverage - a.ratingAverage ||
        b.experienceYears - a.experienceYears
    );

    selectedStaff = available[0]._id;
    

  }

  /* ====== TẠO BOOKING ====== */
  return Booking.create({
    customer,
    staff: selectedStaff,
    bookingType,
    services,
    combo,
    startTime,
    endTime,
    duration,
    price,
    note,
    paymentMethod,
    paymentStatus: "unpaid",
    status: "pending"
    });
};
const ALLOWED_STATUS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
];

/* ================== GET MY BOOKINGS ================== */
export const getMyBookingsService = async (customerId, status,pagination) => {
 if (!status || !ALLOWED_STATUS.includes(status)) {
      throw new Error("Trạng thái booking không hợp lệ");
    }
   const filter = {
    customer: customerId,
    status
  };
  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate({
        path: "staff",
        select: "position user",
        populate: {
          path: "user",
          select: "name email avatar"
        }
      })
      .populate("services.service", "name price finalPrice duration")
      .populate("combo", "name pricing duration")
      .sort({ startTime: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),

    Booking.countDocuments(filter)
  ]);
   return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit)
    }
  };
};
export const getBookingDetailService = async (bookingId, customerId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customer: customerId
  })
    .populate({
      path: "customer",
      select: "name email phone"
    })
    .populate({
      path: "staff",
      select: "position user",
      populate: {
        path: "user",
        select: "name email avatar"
      }
    })
    .populate({
      path: "services.service",
      select: "name price finalPrice duration"
    })
    .populate({
      path: "combo",
      select: "name pricing duration"
    })
    .populate({
      path: "payment"
    });

  if (!booking) {
    throw new Error("Không tìm thấy booking");
  }

  return booking;
};
export const cancelBookingService = async (bookingId, customerId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customer: customerId
  });

  if (!booking) {
    throw new Error("Không tìm thấy booking");
  }

  if (booking.status !== "pending") {
    throw new Error("Chỉ có thể hủy booking khi đang ở trạng thái chờ xác nhận");
  }

  booking.status = "cancelled";

  await booking.save();

  return booking;
};
