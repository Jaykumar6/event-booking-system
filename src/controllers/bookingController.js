import mongoose from "mongoose";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { emailQueue } from "../jobs/queues.js";

export async function createBooking(req, res, next) {
  const session = await mongoose.startSession();

  try {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    let booking;

    await session.withTransaction(async () => {
      const event = await Event.findOneAndUpdate(
        {
          _id: req.params.eventId,
          date: { $gt: new Date() },
          ticketsAvailable: { $gte: quantity }
        },
        { $inc: { ticketsAvailable: -quantity } },
        { new: true, session }
      );

      if (!event) {
        throw new Error("EVENT_NOT_AVAILABLE");
      }

      const customer = await User.findById(req.user.userId).session(session);

      booking = await Booking.create(
        [
          {
            event: event._id,
            customer: customer._id,
            quantity,
            status: "confirmed"
          }
        ],
        { session }
      );

      if (!emailQueue) {
        return res.status(503).json({ message: "Email service is not configured. Please set REDIS_URL." });
      }

      await emailQueue.add(
        "booking-confirmation",
        {
          to: customer.email,
          subject: `Booking confirmed: ${event.title}`,
          html: `
            <h2>Booking Confirmed</h2>
            <p>Hello ${customer.name},</p>
            <p>Your booking for <strong>${event.title}</strong> is confirmed.</p>
            <p>Tickets: ${quantity}</p>
            <p>Date: ${new Date(event.date).toLocaleString()}</p>
            <p>Location: ${event.location}</p>
          `
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: true
        }
      );
    });

    res.status(201).json({
      message: "Booking successful. Confirmation email queued.",
      booking: booking[0]
    });
  } catch (error) {
    if (error.message === "EVENT_NOT_AVAILABLE") {
      return res.status(409).json({
        message: "Event is sold out, has passed, or does not have enough tickets"
      });
    }

    next(error);
  } finally {
    await session.endSession();
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ customer: req.user.userId })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getEventBookings(req, res, next) {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizer: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found or not owned by you" });
    }

    const bookings = await Booking.find({ event: event._id, status: "confirmed" })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}
