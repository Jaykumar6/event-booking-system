import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { notificationQueue } from "../jobs/queues.js";

export async function createEvent(req, res, next) {
  try {
    const { title, description, date, location, totalTickets } = req.body;

    if (!title || !description || !date || !location || !totalTickets) {
      return res.status(400).json({ message: "All event fields are required" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      totalTickets,
      ticketsAvailable: totalTickets,
      organizer: req.user.userId
    });

    res.status(201).json({ message: "Event created", event });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req, res, next) {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found or not owned by you" });
    }

    const allowedFields = ["title", "description", "date", "location"];
    let changed = false;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
        changed = true;
      }
    }

    if (!changed) {
      return res.status(400).json({ message: "No event field was provided" });
    }

    await event.save();

    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed"
    }).populate("customer", "email name");

    if (!notificationQueue) {
      return res.status(503).json({ message: "Notification service is not configured. Please set REDIS_URL." });
    }

    for (const booking of bookings) {
      await notificationQueue.add("event-updated", {
        to: booking.customer.email,
        subject: `Event updated: ${event.title}`,
        html: `
          <h2>Event Update</h2>
          <p>Hello ${booking.customer.name},</p>
          <p>The event <strong>${event.title}</strong> has been updated.</p>
          <p>Date: ${new Date(event.date).toLocaleString()}</p>
          <p>Location: ${event.location}</p>
        `
      });
    }

    res.json({
      message: "Event updated and notification jobs created",
      event,
      notificationsQueued: bookings.length
    });
  } catch (error) {
    next(error);
  }
}
