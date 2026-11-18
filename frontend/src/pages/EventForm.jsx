import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import { toLocalInput } from "../utils.js";

const EMPTY = { title: "", description: "", date: "", location: "", totalTickets: "" };

export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    api
      .event(id)
      .then((e) => {
        if (e.organizer?._id !== user.id) return navigate("/dashboard", { replace: true });
        setForm({
          title: e.title,
          description: e.description,
          date: toLocalInput(e.date),
          location: e.location,
          totalTickets: e.totalTickets
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");

    const tickets = Number(form.totalTickets);
    if (!editing && (!Number.isInteger(tickets) || tickets < 1)) return setError("Total tickets must be a whole number of at least 1.");
    if (!editing && new Date(form.date) <= new Date()) return setError("Pick a date and time in the future.");

    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        location: form.location.trim()
      };
      if (editing) {
        const r = await api.updateEvent(id, body);
        toast(
          r.notificationsQueued
            ? `Event updated. ${r.notificationsQueued} ${r.notificationsQueued === 1 ? "attendee is" : "attendees are"} being notified.`
            : "Event updated."
        );
      } else {
        await api.createEvent({ ...body, totalTickets: tickets });
        toast("Event published.");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;

  return (
    <div className="container section narrow">
      <Link to="/dashboard" className="back">← Dashboard</Link>
      <h1 className="page-title">{editing ? "Edit event" : "Create an event"}</h1>
      <p className="muted">
        {editing
          ? "Attendees with a booking get an email when you save changes."
          : "Add the details people need to decide whether to come."}
      </p>

      <form className="panel" onSubmit={submit}>
        <label className="field">
          <span>Event title</span>
          <input value={form.title} onChange={set("title")} required maxLength={90} placeholder="Bengaluru Product Meetup" />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea value={form.description} onChange={set("description")} required rows={5} placeholder="What will happen, who it's for, and what to bring." />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Date and time</span>
            <input type="datetime-local" value={form.date} onChange={set("date")} required />
          </label>
          <label className="field">
            <span>Location</span>
            <input value={form.location} onChange={set("location")} required placeholder="Venue, city" />
          </label>
        </div>

        <label className="field">
          <span>Total tickets</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.totalTickets}
            onChange={set("totalTickets")}
            required
            disabled={editing}
            placeholder="100"
          />
          {editing && <small className="hint">Ticket capacity can't be changed after publishing.</small>}
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner spinner-sm" /> : editing ? "Save changes" : "Publish event"}
          </button>
        </div>
      </form>
    </div>
  );
}
