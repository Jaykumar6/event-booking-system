import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, TicketX } from "lucide-react";
import { api } from "../api.js";
import Cover from "../components/Cover.jsx";
import { Empty } from "../components/EventCard.jsx";
import { day, month, fmtDate, fmtTime, plural } from "../utils.js";

function TicketRow({ booking }) {
  const e = booking.event;
  if (!e) {
    return (
      <div className="ticket ticket-missing">
        <div className="ticket-main">
          <h3>Event no longer available</h3>
          <p className="meta">{plural(booking.quantity, "ticket")} · booked {fmtDate(booking.createdAt)}</p>
        </div>
      </div>
    );
  }

  const past = new Date(e.date) <= new Date();
  const cancelled = booking.status === "cancelled";

  return (
    <Link to={`/events/${e._id}`} className={`ticket ${past || cancelled ? "is-ended" : ""}`}>
      <Cover event={e} className="ticket-cover">
        <div className="date-badge">
          <b>{day(e.date)}</b>
          <span>{month(e.date)}</span>
        </div>
      </Cover>
      <div className="ticket-main">
        <div className="ticket-title">
          <h3>{e.title}</h3>
          <span className={`chip ${cancelled ? "chip-danger" : past ? "chip-muted" : "chip-ok"} chip-inline`}>
            {cancelled ? "Cancelled" : past ? "Attended" : "Confirmed"}
          </span>
        </div>
        <p className="meta"><MapPin size={15} /> {e.location}</p>
        <p className="meta"><Clock size={15} /> {fmtDate(e.date)}, {fmtTime(e.date)}</p>
      </div>
      <div className="ticket-perf" />
      <div className="ticket-stub">
        <b>{booking.quantity}</b>
        <span>{booking.quantity === 1 ? "ticket" : "tickets"}</span>
        <small>Booked {fmtDate(booking.createdAt)}</small>
      </div>
    </Link>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.myBookings().then(setBookings).catch((e) => setError(e.message));
  }, []);

  const upcoming = (bookings || []).filter((b) => b.event && new Date(b.event.date) > new Date() && b.status !== "cancelled");
  const totalTickets = upcoming.reduce((n, b) => n + b.quantity, 0);

  return (
    <div className="container section narrow">
      <h1 className="page-title">My tickets</h1>
      {bookings && bookings.length > 0 && (
        <p className="muted">
          {upcoming.length === 0
            ? "No upcoming events right now."
            : `${plural(totalTickets, "ticket")} for ${plural(upcoming.length, "upcoming event")}.`}
        </p>
      )}

      {error ? (
        <Empty icon={TicketX} title="Couldn't load your tickets">{error}</Empty>
      ) : !bookings ? (
        <div className="stack">{[0, 1, 2].map((i) => <div key={i} className="sk sk-ticket" />)}</div>
      ) : bookings.length === 0 ? (
        <Empty icon={TicketX} title="No tickets yet">
          When you book an event it will show up here. <Link className="link" to="/">Find an event</Link>
        </Empty>
      ) : (
        <div className="stack">{bookings.map((b) => <TicketRow key={b._id} booking={b} />)}</div>
      )}
    </div>
  );
}
