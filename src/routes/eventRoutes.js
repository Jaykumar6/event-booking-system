import { Router } from "express";
import { createEvent, getEvent, getEvents, updateEvent } from "../controllers/eventController.js";
import { auth, allowRoles } from "../middleware/auth.js";
import { createBooking, getEventBookings, getMyBookings } from "../controllers/bookingController.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEvent);

router.post("/", auth, allowRoles("organizer"), createEvent);
router.put("/:id", auth, allowRoles("organizer"), updateEvent);
router.get("/:eventId/bookings", auth, allowRoles("organizer"), getEventBookings);

router.post("/:eventId/bookings", auth, allowRoles("customer"), createBooking);
router.get("/customer/my-bookings", auth, allowRoles("customer"), getMyBookings);

export default router;
