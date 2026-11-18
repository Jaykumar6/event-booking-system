import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Users, CalendarPlus, CalendarDays, Ticket, Gauge } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Empty, StatusChip, CardSkeletons } from "../components/EventCard.jsx";
import Meter from "../components/Meter.jsx";
import Cover from "../components/Cover.jsx";
import { eventState, fmtDate, fmtTime } from "../utils.js";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={20} strokeWidth={1.8} />
      <div>
        <b>{value}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.events().then(setEvents).catch((e) => setError(e.message));
  }, []);

  // The API has no "my events" endpoint, so filter the public list by organizer id.
  const mine = useMemo(
    () => (events || []).filter((e) => e.organizer?._id === user.id),
    [events, user.id]
  );

  const stats = useMemo(() => {
    const sold = mine.reduce((n, e) => n + (e.totalTickets - e.ticketsAvailable), 0);
    const capacity = mine.reduce((n, e) => n + e.totalTickets, 0);
    const upcoming = mine.filter((e) => !eventState(e).ended).length;
    return { sold, upcoming, fill: capacity ? Math.round((sold / capacity) * 100) : 0 };
  }, [mine]);

  return (
    <div className="container section">
      <div className="page-head">
        <div>
          <h1 className="page-title">Hi {user.name.split(" ")[0]}, here's your lineup</h1>
          <p className="muted">Create events, update details and see who's coming.</p>
        </div>
        <Link to="/dashboard/new" className="btn btn-primary"><Plus size={18} /> New event</Link>
      </div>

      <div className="stats">
        <Stat icon={CalendarDays} label="Upcoming events" value={stats.upcoming} />
        <Stat icon={Ticket} label="Tickets booked" value={stats.sold.toLocaleString()} />
        <Stat icon={Gauge} label="Overall sell-through" value={`${stats.fill}%`} />
      </div>

      <h2 className="section-title">Your events</h2>

      {error ? (
        <Empty icon={CalendarPlus} title="Couldn't load your events">{error}</Empty>
      ) : !events ? (
        <div className="grid"><CardSkeletons count={3} /></div>
      ) : mine.length === 0 ? (
        <Empty icon={CalendarPlus} title="You haven't created an event yet">
          Your first event takes about a minute. <Link className="link" to="/dashboard/new">Create an event</Link>
        </Empty>
      ) : (
        <div className="stack">
          {mine.map((e) => {
            const s = eventState(e);
            return (
              <div key={e._id} className={`row-card ${s.ended ? "is-ended" : ""}`}>
                <Cover event={e} className="row-cover" />
                <div className="row-main">
                  <div className="ticket-title">
                    <Link to={`/events/${e._id}`}><h3>{e.title}</h3></Link>
                    <StatusChip event={e} />
                  </div>
                  <p className="meta">{fmtDate(e.date)}, {fmtTime(e.date)} · {e.location}</p>
                  <div className="row-meter">
                    <Meter event={e} />
                    <span>{s.sold} / {e.totalTickets} booked</span>
                  </div>
                </div>
                <div className="row-actions">
                  <Link to={`/dashboard/events/${e._id}/attendees`} className="btn btn-ghost btn-small"><Users size={16} /> Attendees</Link>
                  <Link to={`/dashboard/events/${e._id}/edit`} className="btn btn-ghost btn-small"><Pencil size={16} /> Edit</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
