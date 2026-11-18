import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, Users } from "lucide-react";
import { api } from "../api.js";
import { Empty } from "../components/EventCard.jsx";
import Meter from "../components/Meter.jsx";
import { eventState, fmtDate, fmtDateTime, fmtTime, plural } from "../utils.js";

export default function Attendees() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.event(id), api.eventBookings(id)])
      .then(([e, b]) => {
        setEvent(e);
        setBookings(b);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  function exportCsv() {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Name", "Email", "Tickets", "Booked at"], ...bookings.map((b) => [b.customer?.name ?? "", b.customer?.email ?? "", b.quantity, new Date(b.createdAt).toISOString()])];
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${event.title.replace(/\W+/g, "-").toLowerCase()}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (error) {
    return (
      <div className="container section narrow">
        <Link to="/dashboard" className="back">← Dashboard</Link>
        <Empty icon={Users} title="Couldn't load attendees">{error}</Empty>
      </div>
    );
  }
  if (!event || !bookings) return <div className="page-loading"><span className="spinner" /></div>;

  const s = eventState(event);
  const tickets = bookings.reduce((n, b) => n + b.quantity, 0);

  return (
    <div className="container section narrow">
      <Link to="/dashboard" className="back">← Dashboard</Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="muted">{fmtDate(event.date)}, {fmtTime(event.date)} · {event.location}</p>
        </div>
        {bookings.length > 0 && (
          <button className="btn btn-ghost" onClick={exportCsv}><Download size={16} /> Export CSV</button>
        )}
      </div>

      <div className="panel summary">
        <div><b>{bookings.length}</b><span>{bookings.length === 1 ? "booking" : "bookings"}</span></div>
        <div><b>{tickets}</b><span>{tickets === 1 ? "ticket" : "tickets"} sold</span></div>
        <div className="grow">
          <Meter event={event} />
          <span>{s.pct}% of {plural(event.totalTickets, "ticket")}</span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Empty icon={Users} title="No bookings yet">Share the event link to get your first attendee.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Attendee</th><th>Email</th><th className="num">Tickets</th><th>Booked</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td><span className="avatar avatar-sm">{(b.customer?.name || "?").charAt(0).toUpperCase()}</span> {b.customer?.name || "Unknown"}</td>
                  <td>{b.customer?.email}</td>
                  <td className="num">{b.quantity}</td>
                  <td>{fmtDateTime(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
