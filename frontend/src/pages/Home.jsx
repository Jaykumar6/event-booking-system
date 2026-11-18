import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, CalendarX2, MapPin, Clock } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import EventCard, { CardSkeletons, Empty } from "../components/EventCard.jsx";
import Cover from "../components/Cover.jsx";
import { day, month, eventState, fmtDate, fmtTime, plural, timeUntil } from "../utils.js";

const FILTERS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "available", label: "Tickets available" },
  { id: "past", label: "Past" }
];

function HeroTicket({ event }) {
  const s = eventState(event);
  return (
    <Link to={`/events/${event._id}`} className="hero-ticket" aria-label={`Next event: ${event.title}`}>
      <Cover event={event} className="hero-ticket-cover">
        <div className="date-badge date-badge-lg">
          <b>{day(event.date)}</b>
          <span>{month(event.date)}</span>
        </div>
      </Cover>
      <div className="hero-ticket-body">
        <small>Next up · {timeUntil(event.date)}</small>
        <h2>{event.title}</h2>
        <p className="meta"><MapPin size={15} /> {event.location}</p>
        <p className="meta"><Clock size={15} /> {fmtDate(event.date)}, {fmtTime(event.date)}</p>
      </div>
      <div className="perf" />
      <div className="hero-ticket-stub">
        <div className="barcode" aria-hidden="true" />
        <div>
          <strong>{plural(event.ticketsAvailable, "ticket")}</strong>
          <span>{s.soldOut ? "all booked" : "left"}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [sort, setSort] = useState("soonest");
  const listRef = useRef(null);

  const load = () => {
    setError("");
    api.events().then(setEvents).catch((e) => setError(e.message));
  };
  useEffect(() => {
    load();
  }, []);

  const upcoming = useMemo(() => (events || []).filter((e) => !eventState(e).ended), [events]);
  const next = upcoming.find((e) => e.ticketsAvailable > 0) || upcoming[0];
  const ticketsLeft = upcoming.reduce((n, e) => n + e.ticketsAvailable, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (events || []).filter((e) => {
      const s = eventState(e);
      if (filter === "upcoming" && s.ended) return false;
      if (filter === "available" && !s.bookable) return false;
      if (filter === "past" && !s.ended) return false;
      return !q || `${e.title} ${e.location} ${e.description}`.toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) =>
      sort === "tickets"
        ? b.ticketsAvailable - a.ticketsAvailable
        : sort === "latest"
        ? new Date(b.date) - new Date(a.date)
        : filter === "past"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [events, query, filter, sort]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Find something worth leaving the house for.</h1>
            <p className="lead">
              Browse upcoming events, pick your tickets and get a confirmation email within seconds of booking.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth" })}>
                Browse events
              </button>
              {!user && <Link to="/register" state={{ role: "organizer" }} className="btn btn-ghost">Host an event</Link>}
              {user?.role === "organizer" && <Link to="/dashboard/new" className="btn btn-ghost">Create an event</Link>}
            </div>
            {events && (
              <p className="hero-stats">
                <b>{upcoming.length}</b> upcoming {upcoming.length === 1 ? "event" : "events"} with{" "}
                <b>{ticketsLeft.toLocaleString()}</b> tickets still available
              </p>
            )}
          </div>

          <div className="hero-visual">
            {next ? (
              <HeroTicket event={next} />
            ) : (
              <div className="hero-ticket hero-ticket-empty">
                <h2>Your event could be here</h2>
                <p>Organizers can publish an event in under a minute.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container section" ref={listRef}>
        <div className="toolbar">
          <label className="search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by title, place or keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
          </label>

          <div className="chips" role="tablist" aria-label="Filter events">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`chip-btn ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort events">
            <option value="soonest">Soonest first</option>
            <option value="latest">Latest first</option>
            <option value="tickets">Most tickets left</option>
          </select>
        </div>

        {error ? (
          <Empty icon={CalendarX2} title="Couldn't load events">
            {error} <button className="link" onClick={load}>Try again</button>
          </Empty>
        ) : !events ? (
          <div className="grid"><CardSkeletons /></div>
        ) : visible.length === 0 ? (
          <Empty icon={CalendarX2} title={query ? "No events match your search" : "No events here yet"}>
            {query ? "Try a different keyword or clear the filters." : "Check back soon, or switch the filter above."}
          </Empty>
        ) : (
          <div className="grid">
            {visible.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        )}
      </section>
    </>
  );
}
