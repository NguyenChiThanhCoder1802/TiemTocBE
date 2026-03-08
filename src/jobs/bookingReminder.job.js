import cron from "node-cron";
import Booking from "../models/Booking.model.js";
import { sendBookingReminderEmail } from "../utils/sendEmail.js";

export const startBookingReminderJob = () => {

  cron.schedule("* * * * *", async () => {

    try {

      const now = new Date();

      const oneHourLater = new Date(
        now.getTime() + 60 * 60 * 1000
      );

      const nextMinute = new Date(
        oneHourLater.getTime() + 60 * 1000
      );

      const bookings = await Booking.find({
        startTime: {
          $gte: oneHourLater,
          $lt: nextMinute
        },

        reminderSent: false,

        status: { $in: ["pending", "confirmed"] }

      })
      .populate("customer", "email name")
      .populate("staff", "name");

      for (const booking of bookings) {

        if (!booking.customer?.email) continue;

        await sendBookingReminderEmail({
          email: booking.customer.email,
          customerName: booking.customer.name,
          startTime: booking.startTime,
          staffName: booking.staff?.name || "Stylist"
        });

        booking.reminderSent = true;

        await booking.save();
      }

    } catch (error) {

      console.error("Booking reminder error:", error);

    }

  });

};