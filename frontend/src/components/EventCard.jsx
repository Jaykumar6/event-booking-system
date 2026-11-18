import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import Cover from "./Cover.jsx";
import Meter from "./Meter.jsx";
import { day, month, eventState, fmtTime, timeUntil } from "../utils.js";

export function StatusChip({ event }) {
  const s = eventState(event);
  if (s.ended) return <span className="chip chip-muted">Ended</span>;
  if (s.soldOut) return <span className="chip chip-danger">Sold out</span>;
  if (s.low) return <span className="chip chip-warn">{event.ticketsAvailable} left</span>;
  return <span className="chip chip-ok">On sale</span>;
}

export default function EventCard({ event }) {
  const s = eventState(event);

  return (
    <Link to={`/events/${event._id}`} className={`card ${s.ended ? "is-ended" : ""}`}>
      <Cover event={event}>
        <div className="date-badge">
          <b>{day(event.date)}</b>
          <span>{month(event.date)}</span>
        </div>
        <StatusChip event={event} />
      </Cover>

      <div className="card-body">
        <h3>{event.title}</h3>
        <p className="meta"><MapPin size={15} /> {event.location}</p>
        <p className="meta"><Clock size={15} /> {fmtTime(event.date)} · {timeUntil(event.date)}</p>
      </div>

      <div className="perf" />
      <div className="card-stub">
        <div>
          <strong>{s.soldOut ? "No tickets left" : `${event.ticketsAvailable} of ${event.totalTickets} left`}</strong>
          <Meter event={event} />
        </div>
        <span className="btn btn-small btn-ghost">{s.bookable ? "Get tickets" : "View"}</span>
      </div>
    </Link>
  );
}

export function CardSkeletons({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="card skeleton-card" aria-hidden="true">
      <div className="sk sk-cover" />
      <div className="card-body">
        <div className="sk sk-line" style={{ width: "70%", height: 20 }} />
        <div className="sk sk-line" style={{ width: "45%" }} />
        <div className="sk sk-line" style={{ width: "55%" }} />
      </div>
    </div>
  ));
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      {Icon && <Icon size={34} strokeWidth={1.5} />}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
