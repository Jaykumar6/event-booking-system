import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, CalendarDays, Clock, User, Minus, Plus, PartyPopper, CalendarX2, Pencil } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import Cover from "../components/Cover.jsx";
import Meter from "../components/Meter.jsx";
import { StatusChip, Empty } from "../components/EventCard.jsx";
import { day, month, eventState, fmtDate, fmtTime, plural } from "../utils.js";

const MAX_PER_ORDER = 10;

function BookingPanel({ event, onBooked }) {
  const { user } = useAuth();
  const toast = useToast();
  const s = eventState(event);
  const max = Math.max(1, Math.min(MAX_PER_ORDER, event.ticketsAvailable));
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    setQty((q) => Math.min(q, max));
  }, [max]);

  async function book() {
    setBusy(true);
    try {
      await api.book(event._id, qty);
      setDone(qty);
      toast("Booking confirmed. Check your inbox for the email.");
      onBooked();
    } catch (e) {
      toast(e.message, "error");
      onBooked(); // refresh counts: someone else may have taken the last tickets
    } finally {
      setBusy(false);
    }
  }

  const isOwner = user?.role === "organizer" && user.id === event.organizer?._id;

  return (
    <aside className="booking">
      {done ? (
        <div className="booked">
          <PartyPopper size={34} strokeWidth={1.6} />
          <h3>You're in!</h3>
          <p>{plural(done, "ticket")} booked. A confirmation email is on its way.</p>
          <Link to="/my-bookings" className="btn btn-primary">View my tickets</Link>
          <button className="link" onClick={() => setDone(null)}>Book more</button>
        </div>
      ) : (
        <>
          <div className="booking-head">
            <strong>{s.soldOut ? "Sold out" : plural(event.ticketsAvailable, "ticket") + " left"}</strong>
            <span>of {event.totalTickets}</span>
          </div>
          <Meter event={event} />

          {s.ended ? (
            <p className="note">This event has already taken place.</p>
          ) : s.soldOut ? (
            <p className="note">Every ticket has been booked. Browse other events instead.</p>
          ) : !user ? (
            <>
              <p className="note">Log in to book tickets for this event.</p>
              <Link to="/login" state={{ from: `/events/${event._id}` }} className="btn btn-primary btn-block">Log in to book</Link>
              <Link to="/register" state={{ from: `/events/${event._id}` }} className="btn btn-ghost btn-block">Create an account</Link>
            </>
          ) : user.role === "organizer" ? (
            <>
              <p className="note">Organizer accounts can't book tickets. Use an attendee account to book.</p>
              {isOwner && (
                <Link to={`/dashboard/events/${event._id}/edit`} className="btn btn-ghost btn-block"><Pencil size={16} /> Edit this event</Link>
              )}
            </>
          ) : (
            <>
              <div className="stepper-row">
                <span>Tickets</span>
                <div className="stepper">
                  <button onClick={() => setQty(qty - 1)} disabled={qty <= 1} aria-label="Fewer tickets"><Minus size={16} /></button>
                  <output aria-live="polite">{qty}</output>
                  <button onClick={() => setQty(qty + 1)} disabled={qty >= max} aria-label="More tickets"><Plus size={16} /></button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" onClick={book} disabled={busy}>
                {busy ? <span className="spinner spinner-sm" /> : `Book ${plural(qty, "ticket")}`}
              </button>
              <p className="fine">Up to {MAX_PER_ORDER} tickets per booking. A confirmation email is sent right after.</p>
            </>
          )}
        </>
      )}
    </aside>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  const load = () => api.event(id).then(setEvent).catch((e) => setError(e));
  useEffect(() => {
    setEvent(null);
    setError(null);
    load();
  }, [id]);

  if (error) {
    return (
      <div className="container section">
        <Empty icon={CalendarX2} title={error.status === 404 || error.status === 500 ? "Event not found" : "Couldn't load this event"}>
          {error.message} <Link className="link" to="/">Back to events</Link>
        </Empty>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container section">
        <div className="sk sk-hero" />
      </div>
    );
  }

  return (
    <div className="container section">
      <Link to="/" className="back">← All events</Link>

      <Cover event={event} className="detail-cover">
        <div className="date-badge date-badge-lg">
          <b>{day(event.date)}</b>
          <span>{month(event.date)}</span>
        </div>
        <StatusChip event={event} />
        <h1>{event.title}</h1>
      </Cover>

      <div className="detail-grid">
        <div className="detail-main">
          <ul className="facts">
            <li><CalendarDays size={18} /><div><b>{fmtDate(event.date)}</b><span>Date</span></div></li>
            <li><Clock size={18} /><div><b>{fmtTime(event.date)}</b><span>Starts</span></div></li>
            <li><MapPin size={18} /><div><b>{event.location}</b><span>Location</span></div></li>
            <li><User size={18} /><div><b>{event.organizer?.name || "Organizer"}</b><span>Hosted by</span></div></li>
          </ul>

          <h2>About this event</h2>
          <p className="prose">{event.description}</p>
        </div>

        <BookingPanel event={event} onBooked={load} />
      </div>
    </div>
  );
}
